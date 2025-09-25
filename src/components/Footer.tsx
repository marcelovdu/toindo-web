import Image from "next/image"
import Link from "next/link"

const Footer = () => {
  return (
    <footer className="border-t border-dark-1">
      <div className="flex-center wrapper flex-between flex flex-col gap-4 p-5 text-center sm:flex-row">
        <Link href='/'>
          <Image 
            src="/icons/logo.png"
            alt="logo"
            width={60}
            height={60}
          />
        </Link>

        <p className="text-white">2025 TôIndo. Direitos Reservados.</p>
      </div>
    </footer>
  )
}

export default Footer