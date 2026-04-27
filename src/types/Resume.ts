export interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationYear: string;
}

export interface Resume {
  rawText: string;
  fullName?: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills?: string[];
  workExperience?: WorkExperience[];
  education?: Education[];
  certifications?: string[];
  languages?: string[];
}
