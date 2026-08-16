export interface NavItem {
  id: string;
  label: string;
  index: string;
}

export const navItems: NavItem[] = [
  { id: 'about', label: 'About', index: '01' },
  { id: 'services', label: 'What I Do', index: '02' },
  { id: 'career', label: 'Career', index: '03' },
  { id: 'work', label: 'Work', index: '04' },
  { id: 'stack', label: 'Stack', index: '05' },
  { id: 'credentials', label: 'Credentials', index: '06' },
  { id: 'contact', label: 'Contact', index: '07' },
];
