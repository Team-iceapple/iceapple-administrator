export type Member = {
  name: string;
  extra: string;
};

export type Project = {
  id: string;
  name: string;
  team_name: string;
  members: Member[];
  thumbnail: string;
  pdf_url: string;
  description: string;
  main_url: string;
  year: number;
};

export type ProjectCreateFile = {
  thumbnail: File;
  pdf: File;
};

export type ProjectCreateBody = {
  name: string;
  team_name: string;
  members: Member[];
  description: string;
  main_url: string;
  year: number;
};

export type ProjectUpdateBody = Partial<ProjectCreateBody>;
