export interface Developer {
  id: string;
  name: string;
  role: string;
  experienceYears: number;
}

export interface Technology {
  id: string;
  name: string;
  category: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
}

export interface Domain {
  id: string;
  name: string;
}