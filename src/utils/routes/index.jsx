import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import ScrollToTopOnRouteChange from '@hocs/withScrollTopOnRouteChange';
import withLazyLoadably from '@hocs/withLazyLoadably';
import MinimalLayout from '@/components/layouts/minimalLayout';
import MainLayout from '@/components/layouts/mainLayout';
import Page404 from '@/pages/errorPages/404';
import ProtectedRoute from '../../context/ProtectedRoute';
import PermissionDenied from '@/pages/errorPages/PermissionDenied';

const Dashboard1Page = withLazyLoadably(lazy(() => import('@/pages/dashboardsPages/dashboard1')));
const Dashboard3Page = withLazyLoadably(lazy(() => import('@/pages/dashboardsPages/dashboard3')));
const Dashboard4Page = withLazyLoadably(lazy(() => import('@/pages/dashboardsPages/dashboard4')));
const Dashboard5Page = withLazyLoadably(lazy(() => import('@/pages/dashboardsPages/dashboard5')));
const FormsComponentPage = withLazyLoadably(lazy(() => import('@/pages/componentsPages/forms')));
const Home = withLazyLoadably(lazy(() => import('@/pages/machinemaster/Index')));
const Shiftmaster = withLazyLoadably(lazy(() => import('@/pages/ShiftMaster/index')));
const OperationMaster = withLazyLoadably(lazy(() => import('@/pages/OperationMaster/index')));
const EmployeeMaster = withLazyLoadably(lazy(() => import('@/pages/EmployeeMaster/index')));
const DesignationMaster = withLazyLoadably(lazy(() => import('@/pages/DesignationMaster/index')));
const PlantDetails = withLazyLoadably(lazy(() => import('@/pages/PlantDetails/index')));
const PlanningRelease = withLazyLoadably(lazy(() => import('@/pages/PlanningRelease/index')));
const StatusReport = withLazyLoadably(lazy(() => import('@/pages/StatusReport/Index')));
const RouteSheetSummaryReport = withLazyLoadably(lazy(() => import('@/pages/RouteSheetSummaryReport/Index')));
const GalvaReport = withLazyLoadably(lazy(() => import('@/pages/GalvaReport/Index')));
const CycleTimeReports = withLazyLoadably(lazy(() => import('@/pages/CycleTimeReports/Index')));
const PlanningReport = withLazyLoadably(lazy(() => import('@/pages/PlanningReport/Index')));
const MachineLoadReport = withLazyLoadably(lazy(() => import('@/pages/MachineLoadReport/Index')));
const ProjectWiseReport = withLazyLoadably(lazy(() => import('@/pages/ProjectWiseReport/Index')));
const OperationReports = withLazyLoadably(lazy(() => import('@/pages/OperationReports/Index')));
const ShopFloorRelease = withLazyLoadably(lazy(() => import('@/pages/ShopFloorRelease/index')));
const UserManagement = withLazyLoadably(lazy(() => import('@/pages/UserManage/index')));
const ProcessQCCheck = withLazyLoadably(lazy(() => import('@/pages/Process_QC_Check/index')));
const ChatPage = withLazyLoadably(lazy(() => import('@/pages/ChatPage/Index')));
const Galva = withLazyLoadably(lazy(() => import('@/pages/Galva/index')));
const Despatched = withLazyLoadably(lazy(() => import('@/pages/Despatched/Index')));
const QualityCheck = withLazyLoadably(lazy(() => import('@/pages/QualityCheck/index')));
const LoadersComponentPage = withLazyLoadably(lazy(() => import('@/pages/componentsPages/loaders')));
const TablesComponentPage = withLazyLoadably(lazy(() => import('@/pages/componentsPages/tables')));
const ModalComponentPage = withLazyLoadably(lazy(() => import('@/pages/componentsPages/modal')));
const QRCodeScanner = withLazyLoadably(lazy(() => import('@/pages/QrcodeScan/index')));
const SnackbarComponentPage = withLazyLoadably(lazy(() => import('@/pages/componentsPages/snackbar')));
const CarouselComponentPage = withLazyLoadably(lazy(() => import('@/pages/componentsPages/carousel')));
const NavigationComponentPage = withLazyLoadably(lazy(() => import('@/pages/componentsPages/navigation')));
const CardComponentPage = withLazyLoadably(lazy(() => import('@/pages/uiComponentsPages/card')));
const CardHeaderComponentPage = withLazyLoadably(lazy(() => import('@/pages/uiComponentsPages/cardHeader')));
const PageHeaderComponentPage = withLazyLoadably(lazy(() => import('@/pages/uiComponentsPages/pageHeader')));
const LoginPage = withLazyLoadably(lazy(() => import('@/pages/loginPages/login')));
const LoginSimplePage = withLazyLoadably(lazy(() => import('@/pages/loginPages/loginSimple')));
const LoginSplitPage = withLazyLoadably(lazy(() => import('@/pages/loginPages/loginSplit')));
const SignupSplitPage = withLazyLoadably(lazy(() => import('@/pages/signupPages/signupSplit')));
const SignupSimplePage = withLazyLoadably(lazy(() => import('@/pages/signupPages/signupSimple')));
const SignupPage = withLazyLoadably(lazy(() => import('@/pages/signupPages/signup')));
const Page403 = withLazyLoadably(lazy(() => import('@/pages/errorPages/403')));
const Page500 = withLazyLoadably(lazy(() => import('@/pages/errorPages/500')));
const Page503 = withLazyLoadably(lazy(() => import('@/pages/errorPages/503')));
const Page505 = withLazyLoadably(lazy(() => import('@/pages/errorPages/505')));
const Pricing1Page = withLazyLoadably(lazy(() => import('@/pages/pricingPages/pricing1')));
const Pricing2Page = withLazyLoadably(lazy(() => import('@/pages/pricingPages/pricing2')));
const EditProfilePage = withLazyLoadably(lazy(() => import('@/pages/editProfile')));
const NotificationsPage = withLazyLoadably(lazy(() => import('@/pages/notificationsPage')));
const WIPPage = withLazyLoadably(lazy(() => import('@/pages/wip')));
const SamplePage = withLazyLoadably(lazy(() => import('@/pages/sample')));
const ThemeTypographyPage = withLazyLoadably(lazy(() => import('@/pages/themePages/themeTypography')));
const ThemeColorsPage = withLazyLoadably(lazy(() => import('@/pages/themePages/themeColors')));
const ThemeShadowPage = withLazyLoadably(lazy(() => import('@/pages/themePages/themeShadow')));

function Router() {
	return (
		<BrowserRouter basename="/">
			<AuthProvider>
				<ScrollToTopOnRouteChange>
					<Routes>
						<Route path="/" element={<MinimalLayout />}>
							<Route index element={<LoginSimplePage />} />
							<Route path="pages/">
								<Route path="login" element={<LoginPage />} />
								<Route path="qrcode" element={<QRCodeScanner />} />
								<Route path="login/simple" element={<LoginSimplePage />} />
								<Route path="login/split" element={<LoginSplitPage />} />
								<Route path="signup" element={<SignupPage />} />
								<Route path="signup/simple" element={<SignupSimplePage />} />
								<Route path="signup/split" element={<SignupSplitPage />} />
							</Route>
						</Route>
						<Route path="/" element={<MainLayout />}>
							<Route path="samplePage" element={<SamplePage />} />
							<Route path="dashboards/">
								<Route
									path="dashboard1"
									element={
										<ProtectedRoute>
											<Dashboard1Page />
										</ProtectedRoute>
									}
								/>

								<Route
									path="dashboard3"
									element={
										<ProtectedRoute>
											<Dashboard3Page />
										</ProtectedRoute>
									}
								/>
								<Route path="dashboard4" element={<Dashboard4Page />} />
								<Route path="dashboard5" element={<Dashboard5Page />} />
							</Route>

							<Route path="components/">
								<Route
									path="newform"
									element={
										<ProtectedRoute>
											<Home />
										</ProtectedRoute>
									}
								/>
								<Route path="form" element={<FormsComponentPage />} />
								<Route path="loaders" element={<LoadersComponentPage />} />
								<Route path="tables" element={<TablesComponentPage />} />
								<Route path="modal" element={<ModalComponentPage />} />
								<Route path="snackbar" element={<SnackbarComponentPage />} />
								<Route path="carousel" element={<CarouselComponentPage />} />
								<Route path="navigation" element={<NavigationComponentPage />} />
								<Route path="card" element={<CardComponentPage />} />
								<Route path="cardHeader" element={<CardHeaderComponentPage />} />
								<Route path="pageHeader" element={<PageHeaderComponentPage />} />
							</Route>

							<Route path="theme/">
								<Route path="typography" element={<ThemeTypographyPage />} />
								<Route path="colors" element={<ThemeColorsPage />} />
								<Route path="boxShadow" element={<ThemeShadowPage />} />
							</Route>

							<Route path="pages/">
								<Route path="settings" element={<EditProfilePage />} />
								<Route
									path="shiftmaster"
									element={
										<ProtectedRoute requiredRole={['SUPERADMIN', 'ADMIN']}>
											<Shiftmaster />
										</ProtectedRoute>
									}
								/>
								<Route
									path="employeemaster"
									element={
										<ProtectedRoute requiredRole={['SUPERADMIN', 'ADMIN']}>
											<EmployeeMaster />
										</ProtectedRoute>
									}
								/>
								<Route
									path="plantdetails"
									element={
										<ProtectedRoute requiredRole={['SUPERADMIN']}>
											<PlantDetails />
										</ProtectedRoute>
									}
								/>
								<Route
									path="designationmaster"
									element={
										<ProtectedRoute requiredRole={['SUPERADMIN', 'ADMIN']}>
											<DesignationMaster />
										</ProtectedRoute>
									}
								/>
								<Route
									path="operationmaster"
									element={
										<ProtectedRoute requiredRole={['SUPERADMIN', 'ADMIN']}>
											<OperationMaster />
										</ProtectedRoute>
									}
								/>
								<Route
									path="planningrelease"
									element={
										<ProtectedRoute requiredRole={['SUPERADMIN', 'ADMIN', 'PLANNING']}>
											<PlanningRelease />
										</ProtectedRoute>
									}
								/>
								<Route
									path="shopfloorrelease"
									element={
										<ProtectedRoute requiredRole={['SUPERADMIN', 'ADMIN', 'SHOP FLOOR']}>
											<ShopFloorRelease />
										</ProtectedRoute>
									}
								/>
								<Route
									path="processqccheck"
									element={
										<ProtectedRoute requiredRole={['SUPERADMIN', 'ADMIN', 'PROCESS CAPT']}>
											<ProcessQCCheck />
										</ProtectedRoute>
									}
								/>
								<Route
									path="qualitycheck"
									element={
										<ProtectedRoute requiredRole={['SUPERADMIN', 'ADMIN', 'QUALITY CHECK']}>
											<QualityCheck />
										</ProtectedRoute>
									}
								/>
								<Route
									path="galva"
									element={
										<ProtectedRoute requiredRole={['SUPERADMIN', 'ADMIN', 'GALVA']}>
											<Galva />
										</ProtectedRoute>
									}
								/>
								<Route
									path="despatched"
									element={
										<ProtectedRoute requiredRole={['SUPERADMIN', 'ADMIN', 'RFD']}>
											<Despatched />
										</ProtectedRoute>
									}
								/>
								<Route
									path="statusreport"
									element={
										<ProtectedRoute
										// requiredRole={[
										// 	'SUPERADMIN',
										// 	'ADMIN',
										// 	'RFD',
										// 	'GALVA',
										// 	'QUALITY CHECK',
										// 	'PROCESS CAPT',
										// 	'PLANNING',
										// 	'SHOP FLOOR',
										// 	'REPORTS',
										// ]}
										>
											<StatusReport />
										</ProtectedRoute>
									}
								/>
								<Route
									path="operationreports"
									element={
										<ProtectedRoute
										// requiredRole={[
										// 	'SUPERADMIN',
										// 	'ADMIN',
										// 	'RFD',
										// 	'GALVA',
										// 	'QUALITY CHECK',
										// 	'PROCESS CAPT',
										// 	'PLANNING',
										// 	'SHOP FLOOR',
										// 	'REPORTS',
										// ]}
										>
											<OperationReports />
										</ProtectedRoute>
									}
								/>
								<Route
									path="cycletimereports"
									element={
										<ProtectedRoute>
											<CycleTimeReports />
										</ProtectedRoute>
									}
								/>
								<Route
									path="planningreport"
									element={
										<ProtectedRoute>
											<PlanningReport />
										</ProtectedRoute>
									}
								/>
								<Route
									path="projectwise"
									element={
										<ProtectedRoute>
											<ProjectWiseReport />
										</ProtectedRoute>
									}
								/>
								<Route
									path="routesheetsummaryreport"
									element={
										<ProtectedRoute>
											<RouteSheetSummaryReport />
										</ProtectedRoute>
									}
								/>
								<Route
									path="galvaReport"
									element={
										<ProtectedRoute>
											<GalvaReport />
										</ProtectedRoute>
									}
								/>
								<Route
									path="machineLoadReport"
									element={
										<ProtectedRoute>
											<MachineLoadReport />
										</ProtectedRoute>
									}
								/>
								<Route
									path="usermanagement"
									element={
										<ProtectedRoute requiredRole={['SUPERADMIN', 'ADMIN']}>
											<UserManagement />
										</ProtectedRoute>
									}
								/>
								<Route
									path="chat"
									element={
										<ProtectedRoute>
											<ChatPage />
										</ProtectedRoute>
									}
								/>
								<Route path="notifications" element={<NotificationsPage />} />
								<Route path="pricing/">
									<Route path="pricing1" element={<Pricing1Page />} />
									<Route path="pricing2" element={<Pricing2Page />} />
								</Route>
								<Route path="error/">
									<Route path="404" element={<Page404 />} />
									<Route path="403" element={<Page403 />} />
									<Route path="500" element={<Page500 />} />
									<Route path="503" element={<Page503 />} />
									<Route path="505" element={<Page505 />} />
								</Route>
							</Route>
						</Route>
						<Route path="/" element={<MainLayout container={false} pb={false} />}>
							<Route path="pages/">
								<Route path="wip" element={<WIPPage />} />
							</Route>
						</Route>
						<Route path="*" element={<Page404 />} />
						<Route path="permission-denied" element={<PermissionDenied />} />
					</Routes>
				</ScrollToTopOnRouteChange>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default Router;
