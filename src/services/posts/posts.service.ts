import type { Post } from "~components/posts/types";
import apiClient from "~utils/axiosApiClient";

const getPosts = async (): Promise<Post[]> => {
  return apiClient.get<Post[]>("/posts");
};

const savePost = async (): Promise<Post> => {
  const data: Post = {
    title: "foo",
    body: "bar",
    userId: 1,
    id: 1,
  };
  const params = { exampleSimpleParam: "simpleParam", exampleComposedParam: ["param1", "param2"] };
  return apiClient.post<Post, Post>(`/posts`, data, {
    params,
  });
};
const postService = {
  getPosts,
  savePost,
};
export default postService;
