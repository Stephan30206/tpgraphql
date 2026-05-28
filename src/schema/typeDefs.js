import { gql } from 'graphql-tag';

const typeDefs = gql`

  # ─── TYPES PRINCIPAUX ──────────────────────────────────────

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
    author:    User!       # relation ManyToOne
    comments:  [Comment!]! # relation OneToMany
  }

  type Comment {
    id:        ID!
    body:      String!
    createdAt: String!
    author:    User!       # qui a commenté
    post:      Post!       # sur quel article
  }

  # ─── TYPE RETOUR AUTHENTIFICATION ──────────────────────────

  type AuthPayload {
    token: String!    # JWT Bearer token
    user:  User!      # données de l'utilisateur connecté
  }

  # ─── TYPES PAGINATION (Bonus 1) ────────────────────────────

  type PostPagination {
    data:       [Post!]!
    total:      Int!
    page:       Int!
    limit:      Int!
    totalPages: Int!
    hasNext:    Boolean!
    hasPrev:    Boolean!
  }

  # ─── INPUTS ────────────────────────────────────────────────

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

  # ─── QUERIES ───────────────────────────────────────────────

  type Query {
    # liste tous les utilisateurs
    users: [User!]!

    # récupère un user par ID
    user(id: Int!): User

    # liste tous les articles (avec pagination optionnelle)
    posts(page: Int, limit: Int): PostPagination!

    # récupère un article par ID
    post(id: Int!): Post

    # retourne l'utilisateur authentifié (JWT requis)
    me: User
  }

  # ─── MUTATIONS ─────────────────────────────────────────────

  type Mutation {
    # authentification → retourne un JWT
    login(email: String!, password: String!): AuthPayload!

    # créer un article (authentification requise)
    createPost(input: CreatePostInput!): Post!

    # modifier un article (authentification + propriétaire)
    updatePost(id: Int!, input: UpdatePostInput!): Post!

    # supprimer un article (authentification + propriétaire)
    deletePost(id: Int!): Boolean!
  }

`;

export default typeDefs;