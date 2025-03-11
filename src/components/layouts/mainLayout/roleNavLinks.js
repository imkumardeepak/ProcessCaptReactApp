const ROLE_NAV_LINKS = {
	superadmin: {
		main: ['Dashboard', 'Masters', 'Operations', 'Reports', 'User-Manage', 'Chat'],
		sub: {
			Masters: [
				{ title: 'Plant Master', href: '/pages/plantdetails' },
				{ title: 'Operation Master', href: '/pages/operationmaster' },
				{ title: 'Designation Master', href: '/pages/designationmaster' },
				{ title: 'Employee Master', href: '/pages/employeemaster' },
				{ title: 'Shift Master', href: '/pages/shiftmaster' },
				{ title: 'Machine Master', href: '/components/newform' },
			],
			Operations: [
				{ title: 'Planning Release', href: '/pages/planningrelease' },
				{ title: 'ShopFloor Release', href: '/pages/shopfloorrelease' },
				{ title: 'Process Capture', href: '/pages/processqccheck' },
				{ title: 'Quality Check', href: '/pages/qualitycheck' },
				{ title: 'Galvanising', href: '/pages/galva' },
				{ title: 'RFD', href: '/pages/despatched' },
			],
			Reports: [{ title: 'Status Report', href: '/pages/statusreport' }],
			// Add more groups as necessary
		},
	},
	admin: {
		main: ['Dashboard', 'Masters', 'Operations', 'Reports', 'Chat'],
		sub: {
			Masters: [
				{ title: 'Plant Master', href: '/pages/plantdetails' },
				// Other submenus as needed
			],
			Operations: [
				{ title: 'Planning Release', href: '/pages/planningrelease' },
				// Other submenus as needed
			],
			Reports: [{ title: 'Status Report', href: '/pages/statusreport' }],
		},
	},
	employee: {
		main: ['Dashboard', 'Chat'],
		sub: {},
	},
};

export default ROLE_NAV_LINKS;
