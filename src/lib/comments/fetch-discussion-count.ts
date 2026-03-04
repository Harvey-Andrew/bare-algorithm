/**
 * 服务端：通过 GitHub GraphQL API 查询指定 Discussion 线程的评论数量。
 * 仅在构建时 / SSR 中使用，不暴露到客户端。
 */

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

/**
 * 通过 giscus 的 term 查询 Discussion 的评论总数（comments + replies）。
 * 无 token / 网络异常 / 无匹配线程时，静默返回 0，不阻塞构建。
 */
export async function fetchDiscussionCommentCount(term: string): Promise<number> {
  const token = process.env.GITHUB_TOKEN ?? '';
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO ?? '';
  const categoryName = process.env.NEXT_PUBLIC_GISCUS_CATEGORY ?? '';

  if (!token || !repo) {
    return 0;
  }

  const [owner, name] = repo.split('/');
  if (!owner || !name) {
    return 0;
  }

  try {
    // 1. 查找匹配 term 的 Discussion
    const searchQuery = `repo:${repo} category:${JSON.stringify(categoryName)} in:title ${term}`;

    const query = `
      query ($searchQuery: String!) {
        search(query: $searchQuery, type: DISCUSSION, first: 1) {
          nodes {
            ... on Discussion {
              comments {
                totalCount
              }
            }
          }
        }
      }
    `;

    const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'bare-algorithm-visualization',
      },
      body: JSON.stringify({ query, variables: { searchQuery } }),
      next: { revalidate: 3600 }, // 缓存 1 小时
    });

    if (!response.ok) {
      return 0;
    }

    const json = (await response.json()) as {
      data?: {
        search?: {
          nodes?: Array<{
            comments?: { totalCount?: number };
          }>;
        };
      };
    };

    const nodes = json.data?.search?.nodes;
    if (!nodes || nodes.length === 0) {
      return 0;
    }

    const discussion = nodes[0];
    const commentCount = discussion?.comments?.totalCount ?? 0;

    return commentCount;
  } catch {
    return 0;
  }
}
