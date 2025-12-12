// Mock for Next.js navigation module
export const useRouter = () => ({
  push: (path: string) => {
    console.log('Navigation to:', path);
    // In a real app, you could use React Router here
    // For now, we'll just log it
  },
  replace: (path: string) => {
    console.log('Replace navigation to:', path);
  },
  back: () => {
    console.log('Navigate back');
    window.history.back();
  },
  forward: () => {
    console.log('Navigate forward');
    window.history.forward();
  },
  refresh: () => {
    console.log('Refresh');
    window.location.reload();
  },
});

