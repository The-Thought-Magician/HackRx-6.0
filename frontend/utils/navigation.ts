export interface RouteType {
  name: string;
  layout: string;
  path: string;
  icon?: React.ComponentType<any>;
  secondary?: boolean;
}

export const getActiveRoute = (routes: RouteType[], pathname: string): string => {
  const activeRoute = routes.find(route => {
    // Handle root path
    if (route.path === '/' && pathname === '/') {
      return true;
    }
    
    // Handle other paths
    if (route.path !== '/' && pathname.includes(route.path)) {
      return true;
    }
    
    return false;
  });

  return activeRoute?.name || 'Default';
};

export const isRouteActive = (routePath: string, pathname: string): boolean => {
  if (routePath === '/' && pathname === '/') {
    return true;
  }
  
  if (routePath !== '/' && pathname.includes(routePath)) {
    return true;
  }
  
  return false;
};