"use client";

import { useRouter } from 'next/router';
import React from 'react';

const BlogPost: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  // Fetch the post data based on the ID (static or dynamic fetching can be implemented)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Blog Post Title (ID: {id})</h1>
      <p className="text-gray-500 text-sm">Date: October 14, 2024</p>
      <div className="mt-4">
        <p>
          {/* Blog content goes here */}
          This is the content of the blog post. Replace with your actual post content.
        </p>
      </div>
    </div>
  );
};

export default BlogPost;
