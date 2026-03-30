import type { Post } from "~components/posts/types";
import type BaseError from "~errors/BaseError";
import { postService } from "~services/posts";

import { postsQueryKey } from "./keys";

import { useQuery } from "react-query";

interface IPostQuery {
  loading: boolean;
  error: BaseError | null;
  posts: Post[] | undefined;
}

function usePostsQuery(): IPostQuery {
  const { isLoading: loading, data: posts, error } = useQuery<Post[], BaseError>(postsQueryKey(), postService.getPosts);

  return { loading, error, posts };
}

export default usePostsQuery;
