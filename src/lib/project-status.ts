export type ProjectStatusLike = string | null | undefined;

export const isApprovedStatus = (status: ProjectStatusLike) =>
  status === 'approved' || status === 'published';

export const normalizeProjectStatus = (status: ProjectStatusLike) => {
  if (isApprovedStatus(status)) return 'approved';
  if (status === 'review' || status === 'changes' || status === 'archived' || status === 'draft') {
    return status;
  }
  return 'draft';
};

export const isOverdueProject = (
  project: { deadline?: string | Date | null; status?: ProjectStatusLike },
  now = new Date()
) => {
  if (!project.deadline) return false;

  return new Date(project.deadline).getTime() < now.getTime()
    && !isApprovedStatus(project.status)
    && project.status !== 'archived';
};