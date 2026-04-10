export type ParentInfo = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
};

export type LearningCondition = {
  id: string;
  name: string;
  color: string | null;
};

export type CycleGrade = {
  cycleId: string;
  cycleName: string;
  grade: number | null;
  absences: number;
};

export type SubjectReport = {
  groupHasClassId: string;
  subjectId: string;
  subjectName: string;
  cycles: CycleGrade[];
  finalGrade: number | null;
};

export type StudentInGroup = {
  id: string;
  enrolledId: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
  parents: ParentInfo[];
  learning_conditions: LearningCondition[];
  subjects: SubjectReport[];
};

export type GroupSubject = {
  groupHasClassId: string;
  subjectId: string;
  subjectName: string;
};

export type GroupCycle = {
  cycleId: string;
  cycleName: string;
};

export type GroupWithStudents = {
  id: string;
  name: string;
  year: string | null;
  course: { id: string; name: string } | null;
  groupSubjects: GroupSubject[];
  groupCycles: GroupCycle[];
  students: StudentInGroup[];
};
