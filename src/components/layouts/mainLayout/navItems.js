import { v4 as uuid } from 'uuid';
// Icons
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import Home from '@mui/icons-material/Home';
import Settings from '@mui/icons-material/Settings';
import { ChatBubbleOutline } from '@mui/icons-material';

/**
 * @example
 * {
 *	id: number,
 *	type: "group" | "item",
 *	title: string,
 *	Icon: NodeElement
 *	menuChildren?: {title: string, href: string}[]
 *  menuMinWidth?: number
 * }
 */

const NAV_LINKS_CONFIG = [
	{
		id: uuid(),
		type: 'item',
		title: 'Dashboard',
		Icon: Home,
		href: 'dashboards/dashboard3',
	},
	{
		id: uuid(),
		type: 'group',
		title: 'Masters',
		Icon: GridViewOutlinedIcon,
		menuChildren: [
			{
				title: 'Plant Master',
				href: '/pages/plantdetails',
			},
			{
				title: 'Operation Master',
				href: '/pages/operationmaster',
			},
			{
				title: 'Designation Master',
				href: '/pages/designationmaster',
			},
			{
				title: 'Employee Master',
				href: '/pages/employeemaster',
			},
			{
				title: 'Shift Master',
				href: '/pages/shiftmaster',
			},
			{
				title: 'Machine Master',
				href: '/components/newform',
			},
		],
	},
	{
		id: uuid(),
		type: 'group',
		title: 'Operations',
		Icon: Settings,
		menuChildren: [
			{
				title: 'Planning Release',
				href: '/pages/planningrelease',
			},
			{
				title: 'ShopFloor Release',
				href: '/pages/shopfloorrelease',
			},
			{
				title: 'Process Capture',
				href: '/pages/processqccheck',
			},
			{
				title: 'Process Capture Bulk',
				href: '/pages/processqccheckbulk',
			},
			{
				title: 'Quality Check',
				href: '/pages/qualitycheck',
			},
			{
				title: 'Galvanising',
				href: '/pages/galva',
			},
			{
				title: 'RFD',
				href: '/pages/despatched',
			},
		],
	},
	{
		id: uuid(),
		type: 'group',
		title: 'Reports',
		Icon: BarChartOutlinedIcon,
		menuChildren: [
			{
				title: 'Status Report',
				href: '/pages/statusreport',
			},
			{
				title: 'Daily Operation Reports',
				href: '/pages/operationreports',
			},
			{
				title: 'Routesheet Pending Report',
				href: '/pages/routesheetsummaryreport',
			},
			{
				title: 'Routesheet Cycle Reports',
				href: '/pages/cycletimereports',
			},
			{
				title: 'Project Summary Report',
				href: '/pages/projectwise',
			},
			{
				title: 'Planning Summary Report',
				href: '/pages/planningreport',
			},
			{
				title: 'Galva Report',
				href: '/pages/galvaReport',
			},
			{
				title: 'Machine Load Report',
				href: '/pages/machineLoadReport',
			},
		],
	},
	{
		id: uuid(),
		type: 'group',
		title: 'User-Manage',
		Icon: AccountCircleOutlinedIcon,
		menuChildren: [
			{
				title: 'User Management',
				href: '/pages/usermanagement',
			},
		],
	},
	{
		id: uuid(),
		type: 'item',
		title: 'Chat',
		Icon: ChatBubbleOutline,
		href: '/pages/chat',
	},
];

export default NAV_LINKS_CONFIG;
