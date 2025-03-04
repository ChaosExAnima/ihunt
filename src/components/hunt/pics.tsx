import { Camera } from 'lucide-react';

import { Button } from '../ui/button';
import UploadPhoto from '../upload-photo';

export function HuntPics() {
	const handleCrop = async (image: Blob) => {
		return false;
	};
	return (
		<UploadPhoto
			dialogProps={{
				button: (
					<Button size="icon" variant="ghost">
						<Camera />
					</Button>
				),
			}}
			onCrop={handleCrop}
			title="Upload a pic"
		/>
	);
}
