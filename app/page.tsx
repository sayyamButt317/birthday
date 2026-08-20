import BirthdayCelebration from "./BirthdayCelebration";
import { resolveBirthdayImages } from "./image";

export default function Home() {
  const images = resolveBirthdayImages();

  return <BirthdayCelebration images={images} />;
}
