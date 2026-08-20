export const imageURLs = {
  birthday: {
    image1:
      "https://www.instagram.com/p/C4iztcRNvV2/?utm_source=ig_web_copy_link&igsi=NTc4MTIwNjQ2YQ==",
    image2:
      "https://www.instagram.com/p/CbH6JI-tMk6/?utm_source=ig_web_copy_link&igsi=NTc4MTIwNjQ2YQ==",
    image3:
      "https://www.instagram.com/p/CMrrkYUlJhD/?utm_source=ig_web_copy_link&igsi=NTc4MTIwNjQ2YQ==",
    image4:
      "https://www.instagram.com/p/CtwBivZthr7/?utm_source=ig_web_copy_link&igsi=NTc4MTIwNjQ2YQ==",
    image5:
      "https://www.instagram.com/p/CxGbegUtJPY/?utm_source=ig_web_copy_link&igsi=NTc4MTIwNjQ2YQ==",
  },
} as const;

export const birthdayImages = Object.values(imageURLs.birthday);

export type BirthdayImage = {
  src: string;
  alt: string;
};

export function resolveBirthdayImages(): BirthdayImage[] {
  return birthdayImages.map((_, index) => ({
    src: `/api/birthday-image?index=${index}`,
    alt: `Birthday memory ${index + 1}`,
  }));
}
