import { ThemeProvider as MuiThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { esES } from '@mui/material/locale';

import themePalette from './palette';
import themeTypography from './typography';
import componentStyleOverrides from './compStyleOverride';

import { selectThemeConfig } from '@/store/theme/selectors';
import { useSelector } from '@/store';

const getTheme = () => {
	const { mode, borderRadius } = useSelector(selectThemeConfig);

	const baseTypography = themeTypography(); // Get base typography config

	const themeOptions = {
		palette: themePalette(mode),
		typography: {
			...baseTypography, // Spread the base typography
			// Add mobile-specific overrides
			h1: {
				...baseTypography.h1,
				fontSize: '2.5rem',
				'@media (max-width:600px)': {
					fontSize: '2rem',
				},
			},
			h2: {
				...baseTypography.h2,
				fontSize: '2rem',
				'@media (max-width:600px)': {
					fontSize: '1.75rem',
				},
			},
			body1: {
				...baseTypography.body1,
				fontSize: '1rem',
				'@media (max-width:600px)': {
					fontSize: '1.1rem',
				},
			},
			button: {
				...baseTypography.button,
				fontSize: '1rem',
				'@media (max-width:600px)': {
					fontSize: '1.1rem',
				},
			},
		},
		components: componentStyleOverrides(mode),
		spacing: 8,
		shape: {
			borderRadius,
		},
		breakpoints: {
			values: {
				xs: 0,
				sp: 400,
				sm: 600,
				md: 900,
				lg: 1200,
				xl: 1536,
			},
		},
	};

	const theme = createTheme(themeOptions, esES);

	// Add custom shadows
	theme.shadows[25] = '0px 10px 10px -15px #0005';
	theme.shadows[26] = '0px 15px 10px -15px #0003';
	theme.shadows[27] = '0px 15px 12px -15px #0004';

	return theme;
};

function MUITheme({ children }) {
	return (
		<StyledEngineProvider injectFirst>
			<MuiThemeProvider theme={getTheme()}>
				<CssBaseline />
				{children}
			</MuiThemeProvider>
		</StyledEngineProvider>
	);
}

export default MUITheme;
