import type { Post } from "~components/posts/types";
import type BaseError from "~errors/BaseError";
import { postService } from "~services/posts";

import type { UseMutateFunction } from "react-query";
import { useMutation } from "react-query";

interface IPostMutation {
  loading: boolean;
  error: BaseError | null;
  post: Post | undefined;
  mutate: UseMutateFunction<Post, BaseError>;
}

function usePostMutation(): IPostMutation {
  const { isLoading: loading, data: post, error, mutate } = useMutation<Post, BaseError>(postService.savePost);

  return { loading, error, post, mutate };
}

export default usePostMutation;
