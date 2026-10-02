/**
 * Role-based access control utility
 * Based on TruckersMP VTC roles
 */

export const checkPermission = (userRole, feature) => {
    const role = (userRole || '').toLowerCase();
    
    // Roles with full power
    if (role === 'managing director' || role === 'development team') {
        return true;
    }

    // Roles with NO access to hub features
    if (role === 'supporters' || role === 'tracking coordinator' || role === 'retired members') {
        return false;
    }

    // Temporary logic for others until defined: Give basic read access or deny
    // (We'll expand this later based on user input)
    
    switch (feature) {
        case 'view_dashboard':
            return true; // most can view dashboard
        case 'manage_slots':
            return ['event team', 'event manager', 'event organizer'].includes(role);
        case 'manage_media':
            return ['media manager', 'media team', 'graphical artist'].includes(role);
        case 'manage_hr':
            return ['human resources manager', 'human resources team'].includes(role);
        default:
            return false;
    }
};
