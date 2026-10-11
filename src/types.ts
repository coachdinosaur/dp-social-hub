export type Platform = 'youtube' | 'youtube_shorts' | 'tiktok' | 'instagram' | 'facebook' | 'x'

export type PostStatus = 'idea' | 'draft' | 'ready' | 'scheduled' | 'posted'

export interface CheckItem {
  label: string
  done: boolean
}

export interface Metrics {
  views?: number
  likes?: number
  comments?: number
  shares?: number
  saves?: number
  follows?: number
  checked_at?: string
}

export interface Content {
  id: string
  title: string
  kind: 'episode' | 'reel' | 'promo' | 'other'
  notes: string
  created_at: string
}

export interface Post {
  id: string
  content_id: string | null
  platform: Platform
  format: string
  title: string
  caption: string
  hashtags: string[]
  link: string
  scheduled_at: string | null
  posted_at: string | null
  status: PostStatus
  assignee: string
  checklist: CheckItem[]
  metrics: Metrics
  notes: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  done: boolean
  due_date: string | null
  assignee: string
  priority: 'low' | 'normal' | 'high'
  post_id: string | null
  notes: string
  created_at: string
}

export interface HashtagSet {
  id: string
  name: string
  platform: Platform | 'all'
  tags: string[]
  notes: string
}

export interface Idea {
  id: string
  kind: 'idea' | 'question' | 'commenter'
  text: string
  source: string
  phase: string
  status: 'open' | 'planned' | 'used'
  created_at: string
}

export interface Goal {
  id: string
  label: string
  platform: Platform | 'all'
  target: number
  current: number
  updated_at: string
}

export interface Collections {
  contents: Content
  posts: Post
  tasks: Task
  hashtag_sets: HashtagSet
  ideas: Idea
  goals: Goal
}

export type CollectionName = keyof Collections
