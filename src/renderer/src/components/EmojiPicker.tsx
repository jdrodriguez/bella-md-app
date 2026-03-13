import { useState, useRef, useEffect, useMemo } from 'react'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

const CATEGORIES = {
  Smileys: [
    '\u{1F600}', '\u{1F603}', '\u{1F604}', '\u{1F601}', '\u{1F606}', '\u{1F605}', '\u{1F602}', '\u{1F923}',
    '\u{1F60A}', '\u{1F607}', '\u{1F642}', '\u{1F643}', '\u{1F609}', '\u{1F60C}', '\u{1F60D}', '\u{1F970}',
    '\u{1F618}', '\u{1F617}', '\u{1F619}', '\u{1F61A}', '\u{1F60B}', '\u{1F61B}', '\u{1F61C}', '\u{1F92A}',
    '\u{1F61D}', '\u{1F911}', '\u{1F917}', '\u{1F92D}', '\u{1F92B}', '\u{1F914}', '\u{1F910}', '\u{1F928}',
    '\u{1F610}', '\u{1F611}', '\u{1F636}', '\u{1F60F}', '\u{1F612}', '\u{1F644}', '\u{1F62C}', '\u{1F925}',
    '\u{1F60E}', '\u{1F929}', '\u{1F973}', '\u{1F974}', '\u{1F97A}', '\u{1F622}', '\u{1F62D}', '\u{1F624}'
  ],
  Gestures: [
    '\u{1F44D}', '\u{1F44E}', '\u{1F44A}', '\u270A', '\u{1F91B}', '\u{1F91C}', '\u{1F44F}', '\u{1F64C}',
    '\u{1F450}', '\u{1F932}', '\u{1F91D}', '\u{1F64F}', '\u270D\uFE0F', '\u{1F485}', '\u{1F933}', '\u{1F4AA}',
    '\u{1F9B5}', '\u{1F9B6}', '\u{1F442}', '\u{1F443}', '\u{1F9E0}', '\u{1F9B7}', '\u{1F9B4}', '\u{1F440}',
    '\u{1F441}\uFE0F', '\u{1F445}', '\u{1F444}', '\u{1F44B}', '\u{1F91A}', '\u{1F590}\uFE0F', '\u270B', '\u{1F596}',
    '\u{1F44C}', '\u{1F90F}', '\u270C\uFE0F', '\u{1F91E}', '\u{1F91F}', '\u{1F918}', '\u{1F919}', '\u{1F448}',
    '\u{1F449}', '\u{1F446}', '\u{1F595}', '\u{1F447}', '\u261D\uFE0F', '\u{1F91A}', '\u{1F44A}', '\u{1F44B}'
  ],
  Animals: [
    '\u{1F436}', '\u{1F431}', '\u{1F42D}', '\u{1F439}', '\u{1F430}', '\u{1F98A}', '\u{1F43B}', '\u{1F43C}',
    '\u{1F428}', '\u{1F42F}', '\u{1F981}', '\u{1F42E}', '\u{1F437}', '\u{1F43D}', '\u{1F438}', '\u{1F435}',
    '\u{1F648}', '\u{1F649}', '\u{1F64A}', '\u{1F412}', '\u{1F414}', '\u{1F427}', '\u{1F426}', '\u{1F424}',
    '\u{1F423}', '\u{1F425}', '\u{1F986}', '\u{1F985}', '\u{1F989}', '\u{1F987}', '\u{1F43A}', '\u{1F417}',
    '\u{1F434}', '\u{1F984}', '\u{1F41D}', '\u{1F41B}', '\u{1F98B}', '\u{1F40C}', '\u{1F41A}', '\u{1F41E}',
    '\u{1F422}', '\u{1F40D}', '\u{1F98E}', '\u{1F982}', '\u{1F980}', '\u{1F991}', '\u{1F419}', '\u{1F420}'
  ],
  Food: [
    '\u{1F34E}', '\u{1F34F}', '\u{1F350}', '\u{1F34A}', '\u{1F34B}', '\u{1F34C}', '\u{1F349}', '\u{1F347}',
    '\u{1F353}', '\u{1F348}', '\u{1F352}', '\u{1F351}', '\u{1F96D}', '\u{1F34D}', '\u{1F965}', '\u{1F95D}',
    '\u{1F345}', '\u{1F346}', '\u{1F951}', '\u{1F966}', '\u{1F955}', '\u{1F33D}', '\u{1F336}\uFE0F', '\u{1F952}',
    '\u{1F96C}', '\u{1F954}', '\u{1F360}', '\u{1F950}', '\u{1F35E}', '\u{1F956}', '\u{1F968}', '\u{1F96F}',
    '\u{1F9C0}', '\u{1F356}', '\u{1F357}', '\u{1F969}', '\u{1F953}', '\u{1F354}', '\u{1F35F}', '\u{1F355}',
    '\u{1F32D}', '\u{1F96A}', '\u{1F32E}', '\u{1F32F}', '\u{1F959}', '\u{1F9C6}', '\u{1F95A}', '\u{1F373}'
  ],
  Activities: [
    '\u26BD', '\u{1F3C0}', '\u{1F3C8}', '\u26BE', '\u{1F94E}', '\u{1F3BE}', '\u{1F3D0}', '\u{1F3C9}',
    '\u{1F94F}', '\u{1F3B1}', '\u{1F3D3}', '\u{1F3F8}', '\u{1F3D2}', '\u{1F3D1}', '\u{1F94D}', '\u{1F3CF}',
    '\u26F3', '\u{1F94C}', '\u{1F3F9}', '\u{1F3A3}', '\u{1F93A}', '\u{1F945}', '\u{26F8}\uFE0F', '\u{1F6F7}',
    '\u{1F3BF}', '\u{26F7}\uFE0F', '\u{1F3C2}', '\u{1F3CB}\uFE0F', '\u{1F93C}', '\u{1F938}', '\u{1F93D}', '\u{1F93E}',
    '\u{1F3C6}', '\u{1F947}', '\u{1F948}', '\u{1F949}', '\u{1F3C5}', '\u{1F396}\uFE0F', '\u{1F3F5}\uFE0F', '\u{1F397}\uFE0F',
    '\u{1F3AA}', '\u{1F3AD}', '\u{1F3A8}', '\u{1F3AC}', '\u{1F3A4}', '\u{1F3A7}', '\u{1F3B5}', '\u{1F3B6}'
  ],
  Travel: [
    '\u{1F697}', '\u{1F695}', '\u{1F699}', '\u{1F68C}', '\u{1F68E}', '\u{1F3CE}\uFE0F', '\u{1F693}', '\u{1F691}',
    '\u{1F692}', '\u{1F690}', '\u{1F69A}', '\u{1F69B}', '\u{1F69C}', '\u{1F6F4}', '\u{1F6B2}', '\u{1F6F5}',
    '\u{1F3CD}\uFE0F', '\u{1F6A8}', '\u{1F694}', '\u{1F68D}', '\u{1F698}', '\u{1F696}', '\u{1F6A1}', '\u{1F6A0}',
    '\u{1F69F}', '\u{1F683}', '\u{1F68B}', '\u{1F69E}', '\u{1F685}', '\u{1F684}', '\u{1F682}', '\u{1F686}',
    '\u{1F688}', '\u{1F6E9}\uFE0F', '\u2708\uFE0F', '\u{1F6EB}', '\u{1F6EC}', '\u{1F680}', '\u{1F6F8}', '\u{1F6F6}',
    '\u26F5', '\u{1F6A4}', '\u{1F6E5}\uFE0F', '\u{1F6A2}', '\u{1F3D7}\uFE0F', '\u{1F3D8}\uFE0F', '\u{1F3D9}\uFE0F', '\u{1F3DA}\uFE0F'
  ],
  Objects: [
    '\u231A', '\u{1F4F1}', '\u{1F4F2}', '\u{1F4BB}', '\u{1F5A5}\uFE0F', '\u{1F5A8}\uFE0F', '\u{1F5B1}\uFE0F', '\u{1F5B2}\uFE0F',
    '\u{1F579}\uFE0F', '\u{1F4BD}', '\u{1F4BE}', '\u{1F4BF}', '\u{1F4C0}', '\u{1F4FC}', '\u{1F4F7}', '\u{1F4F8}',
    '\u{1F4F9}', '\u{1F3A5}', '\u{1F4FD}\uFE0F', '\u{1F4DE}', '\u260E\uFE0F', '\u{1F4DF}', '\u{1F4E0}', '\u{1F4FA}',
    '\u{1F4FB}', '\u{1F399}\uFE0F', '\u{1F39A}\uFE0F', '\u{1F39B}\uFE0F', '\u{23F1}\uFE0F', '\u{23F2}\uFE0F', '\u23F0', '\u{1F570}\uFE0F',
    '\u{1F4A1}', '\u{1F526}', '\u{1F56F}\uFE0F', '\u{1F4D4}', '\u{1F4D5}', '\u{1F4D6}', '\u{1F4D7}', '\u{1F4D8}',
    '\u{1F4D9}', '\u{1F4DA}', '\u{1F4D3}', '\u{1F4D2}', '\u{1F4C3}', '\u{1F4DC}', '\u{1F4C4}', '\u{1F4F0}'
  ],
  Symbols: [
    '\u2764\uFE0F', '\u{1F9E1}', '\u{1F49B}', '\u{1F49A}', '\u{1F499}', '\u{1F49C}', '\u{1F5A4}', '\u{1F90D}',
    '\u{1F90E}', '\u{1F494}', '\u2763\uFE0F', '\u{1F495}', '\u{1F49E}', '\u{1F493}', '\u{1F497}', '\u{1F496}',
    '\u{1F498}', '\u{1F49D}', '\u{1F49F}', '\u262E\uFE0F', '\u271D\uFE0F', '\u262A\uFE0F', '\u{1F549}\uFE0F', '\u2638\uFE0F',
    '\u2721\uFE0F', '\u{1F52F}', '\u{1F54E}', '\u262F\uFE0F', '\u2626\uFE0F', '\u{1F6D0}', '\u26CE', '\u2648',
    '\u2649', '\u264A', '\u264B', '\u264C', '\u264D', '\u264E', '\u264F', '\u2650',
    '\u2651', '\u2652', '\u2653', '\u26A0\uFE0F', '\u267B\uFE0F', '\u2705', '\u274C', '\u2B50'
  ]
} as const

type CategoryName = keyof typeof CATEGORIES

const CATEGORY_NAMES = Object.keys(CATEGORIES) as CategoryName[]

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryName>('Smileys')
  const containerRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [onClose])

  const filteredEmojis = useMemo(() => {
    if (!search) return CATEGORIES[activeCategory]
    // When searching, flatten all categories and return all (no text-based filter for emojis)
    // Since emojis don't have text labels, search acts on category names
    const lowerSearch = search.toLowerCase()
    const matchingCategories = CATEGORY_NAMES.filter((cat) =>
      cat.toLowerCase().includes(lowerSearch)
    )
    if (matchingCategories.length > 0) {
      return matchingCategories.flatMap((cat) => [...CATEGORIES[cat]])
    }
    // If no category matches, show all
    return CATEGORY_NAMES.flatMap((cat) => [...CATEGORIES[cat]])
  }, [search, activeCategory])

  return (
    <div
      ref={containerRef}
      className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-80 z-50"
    >
      <div className="p-2">
        <input
          type="text"
          placeholder="Search category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 outline-none focus:border-blue-500"
        />
      </div>

      {!search && (
        <div className="flex gap-1 px-2 pb-1 overflow-x-auto">
          {CATEGORY_NAMES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 text-xs rounded whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-8 gap-1 p-2 max-h-48 overflow-y-auto">
        {filteredEmojis.map((emoji, i) => (
          <button
            key={`${emoji}-${i}`}
            onClick={() => {
              onSelect(emoji)
              onClose()
            }}
            className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 cursor-pointer text-center"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
