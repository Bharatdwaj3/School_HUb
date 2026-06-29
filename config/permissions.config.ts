// permissions.config.ts
const PERMISSIONS: Record<string, string[]> = {
  admin: [
    'manage_all',
    'view_all_users', 'list_students', 'list_teachers', 'list_parents', 'list_staff',
    'view_student', 'view_teacher', 'view_parent', 'view_staff',
    'create_student', 'create_teacher', 'create_parent', 'create_staff',
    'update_student', 'update_teacher', 'update_parent', 'update_staff',
    'delete_student', 'delete_teacher', 'delete_parent', 'delete_staff',
    
    'manage_classes', 'manage_timetable', 'manage_subjects',
    'view_attendance', 'mark_attendance', 'manage_attendance',
    'view_fees', 'collect_fees', 'manage_fees',
    'view_results', 'manage_results', 'generate_report_cards',
    'manage_notices', 'manage_events',
    'view_reports', 'export_data',
    'manage_settings', 'manage_roles',
    'view_self', 'update_self',
  ],

  teacher: [
    'view_self', 'update_self',
    'view_my_classes', 'view_students_in_class',
    'mark_attendance', 'view_attendance',
    'enter_grades', 'view_results',
    'view_timetable', 'manage_class_notices',
    'contact_parents',
    
  ],

  student: [
    'view_self', 'update_self',
    'view_my_attendance', 'view_my_timetable',
    'view_my_results', 'view_report_card',
    'view_notices', 'view_events',
    'view_fees_status',
  ],

  parent: [
    'view_self', 'update_self',
    'view_child_profile', 'view_child_attendance',
    'view_child_results', 'view_child_timetable',
    'view_fees', 'pay_fees',
    'view_notices', 'view_events',
    'contact_teacher',
  ],

  staff: [
    'view_self', 'update_self',
    'view_students', 'view_teachers',
    'manage_library', 'manage_transport', 'manage_inventory',
    'view_attendance', 'view_fees',
    'view_notices',
  ],
};

export default PERMISSIONS;

export const hasPermission = (userRole: string, permission: string): boolean => {
  const userPermissions = PERMISSIONS[userRole] || [];
  return userPermissions.includes(permission) || userPermissions.includes('manage_all');
};

export const hasAnyPermission = (userRole: string, permissions: string[]): boolean => {
  return permissions.some(perm => hasPermission(userRole, perm));
};