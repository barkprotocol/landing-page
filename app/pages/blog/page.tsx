"use client";

import React from 'react';
import Link from 'next/link';

interface BlogPost {
  id: number;
  title: string;
  date: string;
  excerpt: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Understanding Blockchain Technology',
    date: 'October 10, 2024',
    excerpt: 'An introduction to the fundamentals of blockchain technology and its applications in various industries.',
  },
  {
    id: 2,
    title: 'Getting Started with NFTs',
    date: 'October 12, 2024',
    excerpt: 'A beginner’s guide to understanding Non-Fungible Tokens (NFTs) and how to create your own.',
  },
  {
    id: 3,
    title: 'The Future of Decentralized Finance',
    date: 'October 14, 2024',
    excerpt: 'Exploring the potential of decentralized finance (DeFi) and how it is reshaping the financial landscape.',
  },
  // Add more blog posts as needed
];

const BlogPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <div>
        {blogPosts.map((post) => (
          <div key={post.id} className="border-b border-gray-300 pb-4 mb-4">
            <Link href={`/blog/${post.id}`}>
              <h2 className="text-2xl font-semibold text-blue-600 hover:underline">
                {post.title}
              </h2>
            </Link>
            <p className="text-gray-500 text-sm">{post.date}</p>
            <p className="text-gray-700">{post.excerpt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
