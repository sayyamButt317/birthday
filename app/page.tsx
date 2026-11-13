import BirthdayCelebration from "./BirthdayCelebration";
import { loadMedia } from "@/lib/photos";

export default function Home() {
  const { queen, wall } = loadMedia();

  return (
    <BirthdayCelebration
      queen={queen}
      photos={wall}
      showPhotoHint={process.env.NODE_ENV !== "production"}
    />
  );
}
