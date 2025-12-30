"use client";

export function SloganSection() {
    return (
        <section className="w-full bg-white text-black py-32 flex flex-col items-center justify-center text-center px-4">
            <div className="max-w-5xl mx-auto leading-[0.9]">
                {/* Line 1 */}
                <div className="flex flex-wrap justify-center items-baseline gap-4 md:gap-6 mb-2 md:mb-4">
                    <span className="text-[10vw] md:text-[7vw] font-bold font-oswald uppercase tracking-tighter">
                        WE DON'T JUST
                    </span>
                    <span className="text-[10vw] md:text-[7vw] font-playfair italic font-light lowercase">
                        design
                    </span>
                </div>

                {/* Line 2 */}
                <div className="flex flex-wrap justify-center items-baseline gap-4 md:gap-6">
                    <span className="text-[10vw] md:text-[7vw] font-playfair italic font-light lowercase">
                        we
                    </span>
                    <span className="text-[12vw] md:text-[9vw] font-bold font-oswald uppercase tracking-tighter transform -rotate-2">
                        DEFINE
                    </span>
                    <span className="text-[10vw] md:text-[7vw] font-bold font-oswald uppercase tracking-tighter">
                        THE FUTURE.
                    </span>
                </div>
            </div>
        </section>
    );
}
