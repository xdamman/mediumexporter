type GetPostOptionsBase = {
  output?: string
  info?: boolean
  frontmatter?: boolean
  debug?: boolean
  commands?: boolean
  draft?: boolean
  jekyll?: boolean
  format?: 'md' | 'mdx';
  imagesPath?: string;
  canonical?: boolean;
}

type GetPostOptionsReturnObject = GetPostOptionsBase & {
  returnObject: true
}

type GetPostOptionsReturnString = GetPostOptionsBase & {
  returnObject?: false
}

export type Story = {
  url: string;
  date: string;
  slug: string;
  title: string;
  author: string;
  license: string;
  subtitle: string;
  language: string;
  featuredImage: string;
  tags: string[];
  images: string[];
  sections: {
    startIndex: number;
    text: string;
  }[];
  paragraphs: {
    startIndex: number;
    text: string;
    type: number;
  }[];
  markdown: string[];
  authors: string[];
}

export function getPost<T extends GetPostOptionsReturnObject | GetPostOptionsReturnString>(url: string, options: T): Promise<T extends GetPostOptionsReturnObject ?  Story | undefined : string | undefined>
export function getFeed(url: string): Promise<void>
