import { PostsContainer } from "~components/posts/PostsContainer";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Posts",
};
const PostsPage: React.FC = () => {
  return <PostsContainer />;
};

export default PostsPage;
