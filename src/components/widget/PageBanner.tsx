import React from "react";

interface PageBannerProps {
  title: string;
  backgroundImage?: string;
  description?: string;
}

export const PageBanner: React.FC<PageBannerProps> = ({
  title,
  backgroundImage = "/placeholder.svg?height=100&width=100",
  description
}) => {
  return (
    <section
      className="relative w-full h-64 mt-16 mb-8 flex items-center justify-start"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold text-white">{title}</h1>
        <p className="text-white mt-5 text-xl">{description}</p>
      </div>
    </section>
  );
};