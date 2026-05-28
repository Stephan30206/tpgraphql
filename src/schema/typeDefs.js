import { gql } from 'graphql-tag';

const typeDefs = gql`

  type User {
    id:        ID!
    name:      String!
    email:     String!
    createdAt: String!
    posts:     [Post!]!
    comments:  [Comment!]!
  }

  type Post {
    id:        ID!
    title:     String!
    content:   String!
    published: Boolean!
    createdAt: String!
    author:    User!
    comments:  [Comment!]!
  }

  type Comment {
    id:        ID!
    body:      String!
    createdAt: String!
    author:    User!
    post:      Post!
  }

  type AuthPayload {
    token: String!
    user:  User!
  }

  type PostPagination {
    data:       [Post!]!
    total:      Int!
    page:       Int!
    limit:      Int!
    totalPages: Int!
    hasNext:    Boolean!
    hasPrev:    Boolean!
  }

  input CreatePostInput {
    title:     String!
    content:   String!
    published: Boolean
  }

  input UpdatePostInput {
    title:     String
    content:   String
    published: Boolean
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
    posts(page: Int, limit: Int): PostPagination!
    post(id: Int!): Post
    me: User
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    createPost(input: CreatePostInput!): Post!
    updatePost(id: Int!, input: UpdatePostInput!): Post!
    deletePost(id: Int!): Boolean!
  }

`;

export default typeDefs;
