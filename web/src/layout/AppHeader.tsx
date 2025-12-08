"use client";
import React from "react";
import { useSidebar } from "../context/SidebarContext";
import { Menu } from "lucide-react";

const AppHeader: React.FC = () => {
    const { toggleMobileSidebar, toggleSidebar } = useSidebar();

    return (
        <header className="sticky top-0 z-40 flex w-full bg-white drop-shadow-sm dark:bg-gray-800 dark:drop-shadow-none">
            <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
                <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
                    {/* Hamburger Toggle BTN Mobile */}
                    <button
                        aria-controls="sidebar"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleMobileSidebar();
                        }}
                        className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
                    >
                        <Menu className="h-5.5 w-5.5" />
                    </button>
                </div>

                <div className="hidden sm:block">
                    <button onClick={toggleSidebar} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Menu className="h-6 w-6 rotate-90" />
                    </button>
                </div>

                <div className="flex items-center gap-3 2xsm:gap-7">
                    {/* User Area */}
                    <div className="relative">
                        <div className="flex items-center gap-4">
                            <span className="hidden text-right lg:block">
                                <span className="block text-sm font-medium text-black dark:text-white">
                                    Admin
                                </span>
                                <span className="block text-xs">Cermont SAS</span>
                            </span>
                            <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                                {/* Avatar placeholder */}
                                <span className="text-xl text-gray-500">A</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
