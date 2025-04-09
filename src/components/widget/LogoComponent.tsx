import Image from "next/image";

export default function LogoComponent() {
    return (
        <span className="bg-white flex justify-start gap-2">
            <Image src={'/Flag_of_Gabon.svg.webp'} alt="Gabon's flag" width={40} height={20} className="w-12 h-8" />
            <span className="font-bold text-2xl">ParkPro</span>
        </span>
    )
}