/*
  Logo:
  - Place your logo file in /src/assets/logo.png
*/
// import logo from './assets/logo.png';
// export const LOGO_URL = logo;
export const LOGO_URL = "https://cdn-icons-png.flaticon.com/512/2921/2921222.png"; // Using the grid icon as logo
export const SITE_NAME = "ClientFlow";

export function getDynamicProject(project: any) {
  if (!project.start_date || !project.end_date) return project;
  
  const start = new Date(project.start_date).getTime();
  const end = new Date(project.end_date).getTime();
  const now = Date.now();
  
  const total = end - start;
  if (total <= 0) return project;
  
  const elapsed = now - start;
  
  let progress = project.progress;
  let status = project.status;
  let stages = project.stages;
  
  if (elapsed <= 0) {
    progress = 0;
    status = project.status === 'completed' ? 'completed' : 'in_progress';
  } else if (elapsed >= total) {
    progress = 100;
    status = 'completed';
    if (stages && Array.isArray(stages)) {
      stages = stages.map(s => ({ ...s, status: 'completed', clientApproved: true }));
    }
  } else {
    const calculatedProgress = Math.round((elapsed / total) * 100);
    progress = Math.max(project.progress, calculatedProgress);
    if (status !== 'completed') {
      status = progress === 100 ? 'completed' : 'in_progress';
      if (status === 'completed' && stages && Array.isArray(stages)) {
        stages = stages.map(s => ({ ...s, status: 'completed', clientApproved: true }));
      }
    }
  }
  
  return {
    ...project,
    progress,
    status,
    stages
  };
}
