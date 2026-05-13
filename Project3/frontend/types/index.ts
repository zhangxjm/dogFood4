export interface Note {
  _id: string
  title: string
  content: string
  directoryId: string | null
  tags: string[]
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface Directory {
  _id: string
  name: string
  parentId: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface DirectoryTree extends Directory {
  children: DirectoryTree[]
}

export interface SyncResult {
  serverNotes: Note[]
  timestamp: string
}
