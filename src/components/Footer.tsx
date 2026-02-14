import { Github, Twitter } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#0f172a] border-t border-white/10 text-gray-400 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm">
                        © {new Date().getFullYear()} MediaFetch. All rights reserved.
                    </div>
                    <div className="flex space-x-6">
                        <a href="#" className="hover:text-violet-400 transition-colors">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="#" className="hover:text-blue-400 transition-colors">
                            <Twitter className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
