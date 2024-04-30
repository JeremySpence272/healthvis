import axios from "axios";
import { useState } from "react";

const UploadComponent: React.FC = () => {
	const [file, setFile] = useState<File | null>(null);
	const [initialDBFinished, setInitialDBFinished] = useState<boolean>(false);
	const [didFillTables, setDidFillTables] = useState<boolean>(false);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
	};

	const handleUpload = async (): Promise<void> => {
		if (file) {
			const formData = new FormData();
			formData.append("file", file);
			try {
				const response = await axios.post(
					"http://localhost:3000/upload",
					formData,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				);
				console.log("uploaded file", response.data);
				setInitialDBFinished(true);
			} catch (err) {
				if (err instanceof Error) {
					console.log(err.message);
				}
			}
		} else {
			console.log("no file uploaded");
		}
	};

	return (
		<div className="w-1/2 mt-24 mx-auto bg-slate-200 rounded py-12 flex flex-col items-center">
			<input type="file" onChange={handleFileChange} />
			<button
				className="rounded border-2 p-2 m-2 border-indigo-600"
				onClick={handleUpload}
			>
				Upload
			</button>
			<p>{`Initial DB Upload Finished: ${initialDBFinished}`}</p>
		</div>
	);
};

export default UploadComponent;
