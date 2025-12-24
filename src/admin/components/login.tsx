import { Login, LoginForm, PasswordInput, required } from 'react-admin';

export function LoginPage() {
	return (
		<Login>
			<p className="text-center">Admin Access</p>
			<LoginForm>
				<PasswordInput
					autoComplete="current-password"
					label="Password"
					source="password"
					validate={required()}
				/>
			</LoginForm>
		</Login>
	);
}
