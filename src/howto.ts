import type { Platform } from './types'

// Step-by-step posting guides, shown on the "How to post" page and in each post's editor.
// Button names follow each app's current wording; if a screen looks different, look for the closest match.

export interface Guide {
  format: string // matches a format in platforms.ts; the editor falls back to the platform's first guide
  where: string
  steps: string[]
  note?: string
}

export const BEFORE = [
  'Open the post in the Hub (Calendar or Posts). Read its Notes: they name the video file, the cover and the link for the first comment.',
  'Click Copy under "Ready-to-paste…". It copies the caption and hashtags together, so you paste once (Ctrl+V).',
  'Have the video ready. Reels are in Road_to_100K/Video_EpNN/Reels/ (a copy in Downloads is easiest to find), episodes in Road_to_100K/Video_EpNN/.',
]

export const AFTER = [
  'Back in the Hub, open the post and click Mark as posted. It saves the real posting time and adds "log results" to-dos for 24 hours and 7 days.',
  'Reply to comments, especially in the first hour.',
  'When a "log results" to-do comes up, open the post → Results, and type the views, likes, comments, shares and saves.',
]

export const ALWAYS = [
  'AI label on wherever the app offers it: the voice and Kuya JB are AI. Where there is no AI label (e.g. Meta Business Suite), end the caption with "AI voice ang gamit sa video na \'to."',
  'No extra auto-captions or music: the English captions and the music are already in the video.',
  'Never leave a black first frame as the cover: pick the frame with the title, or upload the cover image.',
]

export const GUIDES: Record<Platform, Guide[]> = {
  youtube: [
    {
      format: 'Long video', where: 'YouTube Studio on a computer (studio.youtube.com)',
      steps: [
        'Check the channel at the top right is Digital Profits Ph.',
        'Create → Upload videos → Select files → the episode file (Ep##_TL_Full_Avatar.mp4).',
        'Title: copy the post\'s Title. Description: paste the Copy text (chapters, links, disclaimer, hashtags).',
        'Thumbnail → Upload file → the episode thumbnail (Ep##_Thumbnail.png).',
        'Playlists → tick "The ₱100K Investment Challenge".',
        'Audience → "No, it\'s not made for kids".',
        'Show more → Altered content → Yes.',
        'Next → Video elements: Add subtitles (the EN .srt as English, the FIL .srt as Filipino), then the end screen and cards from the episode\'s upload notes.',
        'Next → Checks → Next → Visibility: Schedule. Pick the date and time, and check the time zone says Philippine time → Schedule.',
        'When it\'s live: post and pin the pinned comment, and update the previous episode\'s description and end screen to point to it.',
      ],
    },
  ],
  youtube_shorts: [
    {
      format: 'Short', where: 'YouTube Studio on a computer (studio.youtube.com)',
      steps: [
        'Check the channel at the top right is Digital Profits Ph.',
        'Create → Upload videos → Select files → the vertical reel file. A vertical video under 3 minutes becomes a Short by itself.',
        'Title: copy the post\'s Title (it ends with #Shorts). Description: paste the Copy text.',
        'Thumbnail: skip it. Studio on a computer can\'t set one for Shorts.',
        'Playlists: leave empty. Shorts don\'t go in the series playlist.',
        'Audience → "No, it\'s not made for kids".',
        'Related video → the full episode. This matters most: it puts a tappable link to the episode on the Short.',
        'Show more → Altered content → Yes.',
        'Next → Next → Next → Visibility: Public → Publish.',
      ],
      note: 'Links in Shorts comments aren\'t clickable, so skip the link comment. Related video does that job.',
    },
  ],
  tiktok: [
    {
      format: 'Video', where: 'TikTok app on your phone, or tiktok.com → Upload on a computer',
      steps: [
        'Check you\'re on the Digital Profits PH account.',
        'Phone: tap + → Upload → choose the video → Next. Computer: tiktok.com → Upload → Select video.',
        'Skip editing: no sounds, no auto captions.',
        'Description: paste the Copy text (hashtags included).',
        'Cover: Edit cover / Select cover → the frame with the title.',
        'More options (Show more) → turn on the AI-generated content label.',
        'Who can watch: Everyone. Allow comments: on.',
        'Post.',
        'If the Notes ask for a pinned comment: comment, then press and hold it (or ⋯) → Pin.',
      ],
      note: 'Links aren\'t clickable on TikTok. Say "Digital Profits PH sa YouTube" instead of a link.',
    },
  ],
  instagram: [
    {
      format: 'Reel', where: 'Instagram app on your phone (easiest), or instagram.com on a computer',
      steps: [
        'Switch to the Digital Profits PH account.',
        'Phone: tap + → Reel → choose the video → Next. Computer: Create (+) → Post → Select from computer → the video → crop icon → Original → Next.',
        'Skip editing (no music, no auto captions) → Next.',
        'Caption: paste the Copy text. Instagram captions say "link in bio" because links there don\'t work.',
        'Edit cover → the frame with the title, or "Add from camera roll" for the cover image.',
        'More options / Advanced settings → turn on the AI label.',
        'If Facebook gets its own post: turn off "Share to Facebook" so it isn\'t posted twice with the wrong caption.',
        'Share.',
        'Check the bio link goes to the YouTube channel.',
      ],
      note: 'A reel can also go to Instagram together with Facebook from Meta Business Suite → Create reel (see Facebook · Reel). Then mark both posts as posted.',
    },
  ],
  facebook: [
    {
      format: 'Reel', where: 'Meta Business Suite → Create reel (posts as the Page, to Facebook and Instagram together)',
      steps: [
        'Open Meta Business Suite: on the Digital Profits Ph Page, click Meta Business Suite in the left panel. (Or All tab → "Manage Page on Meta Business Suite" → Create post, then close that window with X.)',
        'On the Business Suite page, click Create reel at the top right, next to Export data. Not Create post: its window has no video upload.',
        'Share to: tick Digital Profits Ph (Facebook) and digitalprofitsclickersph (Instagram) to post on both at once.',
        'Add video → Upload from desktop → the reel file (Downloads).',
        'Reel details → Text: paste one caption that works on both, saying "link sa comments / bio". Leave "Customize post for Facebook and Instagram" off. Ignore the hashtag suggestions that pop up: click an empty spot.',
        'Next. Thumbnail: upload the cover image or pick the frame with the title.',
        'Closed captions: untick "Auto-generated captions": the English captions are already in the video. Remixing: leave as is.',
        'AI label: Business Suite usually doesn\'t offer it, so end the caption with "AI voice ang gamit sa video na \'to."',
        'Share now → Share / Publish.',
        'Facebook: comment as the Page with the YouTube link from the Notes (pick Digital Profits Ph with the small profile picture by the comment box, or Business Suite → Inbox → Comments) → pin it. Instagram needs no comment: the caption says "bio".',
        'In the Hub: Mark as posted on both the Facebook and the Instagram post.',
      ],
      note: 'Don\'t use Facebook\'s own Create menu (⠿ → Create → Reel): it posts as whichever profile you are on, and on our accounts that is a personal profile.',
    },
    {
      format: 'Video', where: 'Meta Business Suite, from the Digital Profits Ph Page on facebook.com',
      steps: [
        'Open the Digital Profits Ph Page → All tab → "Manage Page on Meta Business Suite" box → Create post.',
        'Post to: check it says Digital Profits Ph (untick Instagram if it\'s ticked).',
        'Add photo/video → the episode file. Upload the file itself, not a YouTube link: links get less reach.',
        'Text: paste the Copy text. Add a title if it asks for one.',
        'Thumbnail → upload the episode thumbnail.',
        'AI label: on, if offered.',
        'Publish (or Schedule).',
        'Comment as the Page (pick Digital Profits Ph by the comment box) with the YouTube link from the Notes → pin it.',
      ],
      note: 'Not tried yet on our accounts: on Oct 18 the Create post window showed no media upload. If yours has none either, look for a Create video option on the Business Suite page, or send a screenshot.',
    },
    {
      format: 'Post', where: 'Meta Business Suite, from the Digital Profits Ph Page on facebook.com',
      steps: [
        'Open the Digital Profits Ph Page → All tab → "Manage Page on Meta Business Suite" box → Create post.',
        'Post to: check it says Digital Profits Ph. Paste the Copy text. For a photo post, Add photo → the image.',
        'For a poll: choose Poll in the composer, if offered, and type the choices from the Notes.',
        'Publish.',
        'If the Notes have a link: comment as the Page with it → pin it.',
      ],
      note: 'Photo posts are not tried yet on our accounts: on Oct 18 the Create post window showed no media upload. If you can\'t add the image, send a screenshot.',
    },
  ],
  x: [
    {
      format: 'Video', where: 'x.com on a computer, or the X app',
      steps: [
        'Check you\'re on the Digital Profits PH account.',
        'Click in the "What is happening?!" box → paste the Copy text (up to 280 characters, 1–2 hashtags).',
        'Media icon → attach the video or image.',
        'Post.',
        'Reply to your own post with the link from the Notes. Links in the main post get less reach.',
      ],
    },
  ],
}

export function guideFor(platform: Platform, format: string): Guide {
  const list = GUIDES[platform]
  return list.find((g) => g.format === format) ?? list[0]
}
