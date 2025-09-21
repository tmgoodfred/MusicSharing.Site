export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  passwordHash?: string;
  currentPassword?: string;
}

export enum UserRole {
  User = 0,
  Admin = 1
}

export interface Song {
  id: number;
  title: string;
  artist: string;
  filePath: string;
  artworkPath?: string;
  genre?: string;
  tags?: string[];
  uploadDate: string;
  playCount: number;
  downloadCount: number;
  categories?: Category[];
  comments?: Comment[];
  ratings?: Rating[];
  userId?: number;
  user?: User;
}

export interface Playlist {
  id: number;
  name: string;
  description?: string;
  userId: number;
  user?: User;
  songs?: Song[];
}

export interface Comment {
  id: number;
  songId?: number;
  blogPostId?: number;
  userId?: number;
  commentText: string;
  isAnonymous: boolean;
  createdAt: string;
  user?: User;
}

export interface Rating {
  id: number;
  songId: number;
  userId: number;
  ratingValue: number;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  authorId?: number;
  author?: User;
  publishDate: string;
}

export interface Activity {
  id: number;
  userId: number;
  type: string;
  data?: string;
  createdAt: string;
  user?: User
}

export interface Follower {
  id: number;
  followerUserId: number;
  followedUserId: number;
  followedAt: string;
}

export interface AuthResponse {
  token: string;
}
