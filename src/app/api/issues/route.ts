import { NextResponse } from 'next/server';

type IssueType =
  | 'bug'
  | 'feature'
  | 'question'
  | 'content'
  | 'ui'
  | 'performance'
  | 'algorithm'
  | 'docs';

interface IssueRequestPayload {
  type?: unknown;
  title?: unknown;
  description?: unknown;
  reproduction?: unknown;
  expected?: unknown;
  contact?: unknown;
  website?: unknown;
  turnstileToken?: unknown;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

interface RateLimitState {
  minuteBuckets: Map<string, RateLimitBucket>;
  dayBuckets: Map<string, RateLimitBucket>;
}

declare global {
  var __issueRateLimitState: RateLimitState | undefined;
}

const DEFAULT_REPO = 'Harvey-Andrew/bare-algorithm';
const ISSUE_TYPES: IssueType[] = [
  'bug',
  'feature',
  'question',
  'content',
  'ui',
  'performance',
  'algorithm',
  'docs',
];

const ISSUE_TYPE_LABEL: Record<IssueType, string> = {
  bug: 'Bug 问题',
  feature: '功能建议',
  question: '使用问题',
  content: '题目内容反馈',
  algorithm: '算法错误',
  ui: 'UI / 样式问题',
  performance: '性能问题',
  docs: '文档 / 题解改进',
};

const TURNSTILE_VERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const MINUTE_WINDOW_MS = 60_000;
const DAY_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_PER_MINUTE = readPositiveInt(process.env.ISSUE_RATE_LIMIT_MAX_PER_MINUTE, 3);
const MAX_PER_DAY = readPositiveInt(process.env.ISSUE_RATE_LIMIT_MAX_PER_DAY, 20);

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function isIssueType(value: string): value is IssueType {
  return ISSUE_TYPES.includes(value as IssueType);
}

function getClientIp(request: Request): string {
  const cfConnectingIp = normalizeString(request.headers.get('cf-connecting-ip'));
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const xForwardedFor = normalizeString(request.headers.get('x-forwarded-for'));
  if (xForwardedFor) {
    const firstIp = normalizeString(xForwardedFor.split(',')[0]);
    if (firstIp) {
      return firstIp;
    }
  }

  const xRealIp = normalizeString(request.headers.get('x-real-ip'));
  if (xRealIp) {
    return xRealIp;
  }

  return 'unknown';
}

function getRateLimitState(): RateLimitState {
  if (!globalThis.__issueRateLimitState) {
    globalThis.__issueRateLimitState = {
      minuteBuckets: new Map(),
      dayBuckets: new Map(),
    };
  }

  return globalThis.__issueRateLimitState;
}

function pruneExpiredBuckets(buckets: Map<string, RateLimitBucket>, now: number): void {
  if (buckets.size <= 2_000) {
    return;
  }

  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) {
      buckets.delete(key);
    }
    if (buckets.size <= 1_500) {
      break;
    }
  }
}

function consumeBucket(
  buckets: Map<string, RateLimitBucket>,
  key: string,
  maxAllowed: number,
  windowMs: number,
  now: number
): { allowed: boolean; retryAfterSeconds: number } {
  const current = buckets.get(key);
  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  if (current.count >= maxAllowed) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  current.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  return { allowed: true, retryAfterSeconds };
}

function enforceIssueRateLimit(request: Request): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const clientIp = getClientIp(request);
  const state = getRateLimitState();

  pruneExpiredBuckets(state.minuteBuckets, now);
  pruneExpiredBuckets(state.dayBuckets, now);

  const minuteResult = consumeBucket(
    state.minuteBuckets,
    clientIp,
    MAX_PER_MINUTE,
    MINUTE_WINDOW_MS,
    now
  );
  if (!minuteResult.allowed) {
    return minuteResult;
  }

  const dayResult = consumeBucket(state.dayBuckets, clientIp, MAX_PER_DAY, DAY_WINDOW_MS, now);
  if (!dayResult.allowed) {
    return dayResult;
  }

  return {
    allowed: true,
    retryAfterSeconds: Math.min(minuteResult.retryAfterSeconds, dayResult.retryAfterSeconds),
  };
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timerId);
  }
}

async function verifyTurnstileToken(token: string, remoteIp: string): Promise<boolean> {
  const secret = normalizeString(process.env.TURNSTILE_SECRET_KEY);
  if (!secret) {
    return true;
  }

  const formData = new URLSearchParams();
  formData.set('secret', secret);
  formData.set('response', token);

  if (remoteIp && remoteIp !== 'unknown') {
    formData.set('remoteip', remoteIp);
  }

  try {
    const response = await fetchWithTimeout(
      TURNSTILE_VERIFY_ENDPOINT,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        cache: 'no-store',
      },
      5_000
    );

    if (!response.ok) {
      return false;
    }

    const data = (await response.json().catch(() => null)) as { success?: boolean } | null;
    return data?.success === true;
  } catch {
    return false;
  }
}

function readIssueRepo(): string {
  const fromPublicEnv = process.env.NEXT_PUBLIC_GISCUS_REPO ?? '';
  const fromIssueEnv = process.env.GITHUB_ISSUE_REPO ?? '';
  const repo = fromIssueEnv || fromPublicEnv || DEFAULT_REPO;

  return /^[\w.-]+\/[\w.-]+$/.test(repo) ? repo : DEFAULT_REPO;
}

function formatIssueBody(payload: {
  type: IssueType;
  description: string;
  reproduction: string;
  expected: string;
  contact: string;
  userAgent: string;
  pageUrl: string;
}) {
  const now = new Date().toISOString();
  const sections: string[] = [];

  sections.push('## 来源');
  sections.push(`- 渠道：${payload.pageUrl || 'Unknown'}`);
  sections.push(`- 提交时间：${now}`);
  sections.push(`- 类型：${ISSUE_TYPE_LABEL[payload.type]}`);
  sections.push('');
  sections.push('## 描述');
  sections.push(payload.description);
  sections.push('');

  if (payload.reproduction) {
    sections.push('## 复现步骤');
    sections.push(payload.reproduction);
    sections.push('');
  }

  if (payload.expected) {
    sections.push('## 期望结果');
    sections.push(payload.expected);
    sections.push('');
  }

  if (payload.contact) {
    sections.push('## 联系方式');
    sections.push(payload.contact);
    sections.push('');
  }

  sections.push('## 环境信息');
  sections.push(`- User-Agent: ${payload.userAgent || 'Unknown'}`);

  return sections.join('\n');
}

export async function POST(request: Request) {
  const token = normalizeString(process.env.GITHUB_TOKEN);
  const turnstileSecret = normalizeString(process.env.TURNSTILE_SECRET_KEY);

  if (!token) {
    return NextResponse.json(
      { error: '服务端未配置 GITHUB_TOKEN，暂时无法创建 Issue。' },
      { status: 503 }
    );
  }

  const rateLimitResult = enforceIssueRateLimit(request);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: '提交过于频繁，请稍后再试。' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.retryAfterSeconds),
        },
      }
    );
  }

  let payload: IssueRequestPayload;

  try {
    payload = (await request.json()) as IssueRequestPayload;
  } catch {
    return NextResponse.json({ error: '请求体必须是合法 JSON。' }, { status: 400 });
  }

  const type = normalizeString(payload.type);
  const title = normalizeString(payload.title);
  const description = normalizeString(payload.description);
  const reproduction = normalizeString(payload.reproduction);
  const expected = normalizeString(payload.expected);
  const contact = normalizeString(payload.contact);
  const website = normalizeString(payload.website);
  const turnstileToken = normalizeString(payload.turnstileToken);

  if (website) {
    return NextResponse.json({ error: '请求无效。' }, { status: 400 });
  }

  if (!isIssueType(type)) {
    return NextResponse.json({ error: 'Issue 类型不合法。' }, { status: 400 });
  }

  if (title.length < 6 || title.length > 256) {
    return NextResponse.json({ error: '标题长度需在 6 到 256 个字符之间。' }, { status: 400 });
  }

  if (description.length < 12 || description.length > 65_536) {
    return NextResponse.json(
      { error: '问题描述长度需在 12 到 65536 个字符之间。' },
      { status: 400 }
    );
  }

  if (turnstileSecret) {
    if (!turnstileToken) {
      return NextResponse.json({ error: '请先完成机器人验证后再提交。' }, { status: 400 });
    }

    const passed = await verifyTurnstileToken(turnstileToken, getClientIp(request));
    if (!passed) {
      return NextResponse.json({ error: '机器人验证失败，请重试。' }, { status: 400 });
    }
  }

  const repo = readIssueRepo();
  const [owner, name] = repo.split('/');

  if (!owner || !name) {
    return NextResponse.json({ error: '仓库配置不合法。' }, { status: 500 });
  }

  const userAgent = request.headers.get('user-agent') ?? '';
  const pageUrl = request.headers.get('referer') ?? '';
  const issueTitle = `[${ISSUE_TYPE_LABEL[type]}] ${title}`;
  const issueBody = formatIssueBody({
    type,
    description,
    reproduction,
    expected,
    contact,
    userAgent,
    pageUrl,
  });

  try {
    const githubResponse = await fetch(`https://api.github.com/repos/${owner}/${name}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'bare-algorithm-home-issue-form',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        title: issueTitle,
        body: issueBody,
      }),
      cache: 'no-store',
    });

    const githubData = (await githubResponse.json().catch(() => null)) as {
      number?: number;
      html_url?: string;
      message?: string;
    } | null;

    if (!githubResponse.ok) {
      const message = githubData?.message ?? 'GitHub 接口调用失败。';
      if (/resource not accessible by personal access token/i.test(message)) {
        return NextResponse.json(
          {
            error:
              '创建 Issue 失败：当前 GITHUB_TOKEN 权限不足。请在该 token 对应仓库开启 Issues: Read and write（至少还需 Metadata: Read）后重试。',
          },
          { status: 502 }
        );
      }
      return NextResponse.json({ error: `创建 Issue 失败：${message}` }, { status: 502 });
    }

    const issueNumber = githubData?.number;
    const issueUrl = githubData?.html_url;

    if (typeof issueNumber !== 'number' || typeof issueUrl !== 'string') {
      return NextResponse.json(
        { error: 'Issue 创建成功，但返回结果缺失编号或链接。' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      issueNumber,
      issueUrl,
    });
  } catch {
    return NextResponse.json({ error: '网络异常，无法连接 GitHub。' }, { status: 502 });
  }
}
