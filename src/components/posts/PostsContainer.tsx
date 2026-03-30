"use client";
import { usePostMutation, usePostsQuery } from "~hooks/posts";

export const PostsContainer: React.FC = () => {
  const { loading, posts } = usePostsQuery();
  const { mutate: savePost } = usePostMutation();

  const onSavePost = () => {
    savePost();
  };

  if (loading) return <h1>loading</h1>;

  return (
    <>
      <button className="m-2 bg-slate-600 p-2 text-white" onClick={onSavePost}>
        save post example call
      </button>
      <div>
        {posts?.map(({ id, body, title }) => (
          <div key={id}>
            <h1>{title}</h1>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </>
  );
};
