import type { Collections, CollectionName } from './types'
import { PLATFORMS } from './platforms'

type Data = { [K in CollectionName]: Collections[K][] }

const t = () => new Date().toISOString()
const id = () => crypto.randomUUID()

/** Starter data for demo mode and the first sign-in: the channel's real hashtags, goals and open questions. */
export function seedData(): Data {
  const ep1 = id(), ep2 = id()
  const now = t()
  return {
    contents: [
      { id: ep1, title: 'Episode 1: How I Built ₱100K from ₱1,000', kind: 'episode', notes: 'First video (files Ep00). 8:03.', created_at: now },
      { id: ep2, title: 'Episode 2: Isip Magsasaka, Diskarte ng Chess Player', kind: 'episode', notes: 'Shoutout to Episode 1\'s 5 best commenters still to add.', created_at: now },
    ],
    posts: [
      {
        id: id(), content_id: ep1, platform: 'youtube', format: 'Long video',
        title: 'Paano Ko Nabuo ang ₱100,000 Investment Portfolio Simula sa ₱1,000',
        caption: 'June 11, 2025: ₱1,000 lang ang una kong deposit. Ngayon, ₱100,000 na ang total na naipasok ko.\n\nAlin ang una mong gustong ma-achieve? I-comment mo!',
        hashtags: ['#100KInvestmentChallenge', '#IponTips', '#DigitalProfitsPH'], link: '', scheduled_at: null, posted_at: null,
        status: 'ready', assignee: 'JB', checklist: PLATFORMS.youtube.checklist.map((label) => ({ label, done: false })),
        metrics: {}, notes: 'Pick the 5 best commenters for Episode 2.', updated_at: now,
      },
    ],
    tasks: [
      { id: id(), title: 'Upload Episode 1 to YouTube', done: false, due_date: null, assignee: 'JB', priority: 'high', post_id: null, notes: '', created_at: now },
      { id: id(), title: 'Pick Episode 1\'s 5 best commenters (names + pronunciation)', done: false, due_date: null, assignee: 'JB', priority: 'normal', post_id: null, notes: 'Needed for Episode 2 part 2', created_at: now },
      { id: id(), title: 'Make Episode 2 reels (trailer, Pawn → Queen, Huwag kainin ang binhi, Poisoned pawn)', done: false, due_date: null, assignee: 'Ronaldo', priority: 'normal', post_id: null, notes: '', created_at: now },
      { id: id(), title: 'Name and create the FB community group', done: false, due_date: null, assignee: 'JB', priority: 'low', post_id: null, notes: 'Draft name "DGP Clickers"; suggested "Ka-Profits Community"', created_at: now },
    ],
    hashtag_sets: [
      { id: id(), name: 'Brand (always)', platform: 'all', tags: ['#DigitalProfitsPH', '#KaProfits', '#IponInvestPalago'], notes: '' },
      { id: id(), name: 'Series', platform: 'all', tags: ['#100KInvestmentChallenge', '#100KPortfolioDiary'], notes: '' },
      { id: id(), name: 'Ipon / personal finance', platform: 'all', tags: ['#IponTips', '#PersonalFinancePH', '#PinoyIpon', '#MoneyTipsPH', '#FinancialLiteracyPH'], notes: '' },
      { id: id(), name: 'Investing', platform: 'all', tags: ['#InvestingPH', '#MutualFundsPH', '#PinoyInvestor'], notes: 'Phase 4 topics' },
      { id: id(), name: 'TikTok discovery', platform: 'tiktok', tags: ['#FinTokPH', '#MoneyTok', '#LearnOnTikTok'], notes: '' },
      { id: id(), name: 'Shorts', platform: 'youtube_shorts', tags: ['#Shorts', '#IponTips'], notes: '' },
    ],
    ideas: [
      { id: id(), kind: 'question', text: 'Ano ang Investa?', source: 'JB', phase: 'Phase 4', status: 'open', created_at: now },
      { id: id(), kind: 'question', text: 'Safe ba ang Investa? Magkano ang minimum?', source: 'Expected', phase: 'Phase 4', status: 'open', created_at: now },
      { id: id(), kind: 'question', text: 'Magkano dapat ang emergency fund, at saan itatabi?', source: 'Expected', phase: 'Phase 2', status: 'open', created_at: now },
      { id: id(), kind: 'question', text: 'May utang pa ako, mag-iinvest na ba ako?', source: 'Expected', phase: 'Phase 2', status: 'open', created_at: now },
      { id: id(), kind: 'idea', text: '100K Portfolio Diary (recurring update series)', source: 'JB\'s PDF', phase: '', status: 'open', created_at: now },
    ],
    goals: [
      { id: id(), label: 'YouTube subscribers (first goal, reward for subscribers)', platform: 'youtube', target: 3000, current: 0, updated_at: now },
      { id: id(), label: 'TikTok followers', platform: 'tiktok', target: 1000, current: 0, updated_at: now },
      { id: id(), label: 'Facebook page followers', platform: 'facebook', target: 1000, current: 0, updated_at: now },
    ],
  }
}
