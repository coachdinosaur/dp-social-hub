import type { Platform } from './types'

export interface TimeSlot {
  days: number[] // 0 = Sunday … 6 = Saturday
  from: string // "HH:MM", Philippine time
  to: string
  why: string
}

export interface PlatformInfo {
  id: Platform
  label: string
  short: string
  color: string
  formats: string[]
  titleLimit?: number
  captionLimit: number
  captionLabel: string
  hashtags: { recommended: [number, number]; max?: number; tip: string }
  tips: string[]
  checklist: string[]
  bestTimes: TimeSlot[]
}

const WEEKDAYS = [1, 2, 3, 4, 5]
const ALL = [0, 1, 2, 3, 4, 5, 6]

// Best times are starting points for a Philippine audience (Asia/Manila, UTC+8), drawn from common industry
// guidance. Replace them with what your own Insights show once you have a few weeks of results.
export const PLATFORMS: Record<Platform, PlatformInfo> = {
  youtube: {
    id: 'youtube', label: 'YouTube', short: 'YT', color: '#ff3b30',
    formats: ['Long video', 'Premiere', 'Community post', 'Live'],
    titleLimit: 100, captionLimit: 5000, captionLabel: 'Description',
    hashtags: { recommended: [3, 5], max: 15, tip: 'The first 3 hashtags show above the title. More than 15 and YouTube ignores all of them.' },
    tips: ['Publish 2–3 hours before your audience peaks so the video is indexed by then.', 'Put chapters in the description (0:00 first).', 'Answer comments in the first hour.'],
    checklist: ['Thumbnail uploaded', 'Title (≤ 100 chars, keyword first)', 'Description with chapters + disclaimer', 'Hashtags (3–5)', 'Captions / .srt uploaded', 'End screen + cards', 'Pinned comment', '"Altered or synthetic content" set (AI voice)', 'Playlist added', 'Audience: not made for kids'],
    bestTimes: [
      { days: WEEKDAYS, from: '17:00', to: '19:00', why: 'Indexed before the 7–10 PM evening peak' },
      { days: [0, 6], from: '09:00', to: '11:00', why: 'Weekend late-morning viewing' },
    ],
  },
  youtube_shorts: {
    id: 'youtube_shorts', label: 'YouTube Shorts', short: 'Shorts', color: '#ff6b5e',
    formats: ['Short'],
    titleLimit: 100, captionLimit: 5000, captionLabel: 'Description',
    hashtags: { recommended: [2, 3], max: 15, tip: 'Add #Shorts plus 1–2 topic hashtags.' },
    tips: ['Hook in the first second.', 'Link the full video with the "Related video" field.'],
    checklist: ['Vertical 9:16, ≤ 60 s', 'Hook in first second', 'Title with keyword', 'Related video linked', 'Captions burned in'],
    bestTimes: [
      { days: ALL, from: '12:00', to: '14:00', why: 'Lunch-break scrolling' },
      { days: ALL, from: '19:00', to: '22:00', why: 'Evening peak' },
    ],
  },
  tiktok: {
    id: 'tiktok', label: 'TikTok', short: 'TT', color: '#25f4ee',
    formats: ['Video', 'Photo carousel', 'Story', 'Live'],
    captionLimit: 4000, captionLabel: 'Caption',
    hashtags: { recommended: [3, 5], tip: 'Mix 1–2 broad tags with 2–3 niche ones (#IponTips, #PersonalFinancePH).' },
    tips: ['First 1–2 seconds decide the view.', 'On-screen text helps people watching on mute.', 'Reply to comments with video replies.'],
    checklist: ['Vertical 9:16', 'Hook in first 1–2 s', 'On-screen captions', 'Cover image set', 'Caption + 3–5 hashtags', '"AI-generated" label if needed', 'Pinned comment'],
    bestTimes: [
      { days: [2, 4, 5], from: '12:00', to: '14:00', why: 'Lunch break, strongest weekdays' },
      { days: ALL, from: '19:00', to: '23:00', why: 'Evening peak, highest PH usage' },
    ],
  },
  instagram: {
    id: 'instagram', label: 'Instagram', short: 'IG', color: '#e1306c',
    formats: ['Reel', 'Carousel', 'Post', 'Story'],
    captionLimit: 2200, captionLabel: 'Caption',
    hashtags: { recommended: [3, 5], max: 30, tip: 'Only the first ~125 characters show before "more". Keep 3–5 relevant hashtags.' },
    tips: ['Links in captions are not clickable: say "link in bio".', 'Share the Reel to your Story.', 'Use Collab with JB\'s account if posting from two accounts.'],
    checklist: ['Cover image chosen', 'First 125 chars hook', 'Caption + 3–5 hashtags', '"Link in bio" updated', 'Shared to Story', 'Alt text added'],
    bestTimes: [
      { days: [3, 5], from: '11:00', to: '13:00', why: 'Midday, strongest weekdays' },
      { days: ALL, from: '19:00', to: '21:00', why: 'After-work scrolling' },
    ],
  },
  facebook: {
    id: 'facebook', label: 'Facebook', short: 'FB', color: '#1877f2',
    formats: ['Reel', 'Video', 'Post', 'Group post', 'Story', 'Live'],
    captionLimit: 63206, captionLabel: 'Post text',
    hashtags: { recommended: [1, 3], tip: 'Hashtags matter little on Facebook. 1–3 brand tags are enough.' },
    tips: ['Upload video natively; links to YouTube get less reach.', 'Share to the Ka-Profits community group.', 'Ask a question to get comments.'],
    checklist: ['Native upload (not a YouTube link)', 'Thumbnail / cover', 'Caption with a question', 'Shared to Ka-Profits group', 'Pinned/first comment with YouTube link'],
    bestTimes: [
      { days: WEEKDAYS, from: '12:00', to: '13:00', why: 'Lunch break' },
      { days: ALL, from: '19:00', to: '21:00', why: 'Evening, highest PH Facebook activity' },
    ],
  },
  x: {
    id: 'x', label: 'X', short: 'X', color: '#9aa4b2',
    formats: ['Post', 'Thread', 'Video'],
    captionLimit: 280, captionLabel: 'Post',
    hashtags: { recommended: [1, 2], tip: '1–2 hashtags at most; more looks spammy.' },
    tips: ['Lead with the number or the result.', 'Break longer ideas into a thread.'],
    checklist: ['≤ 280 characters', 'Image / video attached', '1–2 hashtags', 'Link in reply, not main post'],
    bestTimes: [
      { days: WEEKDAYS, from: '08:00', to: '10:00', why: 'Morning commute' },
      { days: WEEKDAYS, from: '12:00', to: '13:00', why: 'Lunch break' },
    ],
  },
}

export const PLATFORM_LIST = Object.values(PLATFORMS)

export const STATUSES = [
  { id: 'idea', label: 'Idea' },
  { id: 'draft', label: 'Draft' },
  { id: 'ready', label: 'Ready' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'posted', label: 'Posted' },
] as const

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
