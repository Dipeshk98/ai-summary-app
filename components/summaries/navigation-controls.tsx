interface NavigationControlsProps {
    currentSection: number;
    totalSections: number;
    onPrevious: () => void;
    onNext: () => void;
    onSectionselect: (section: number) => void;
}

export function NavigationControls({
    currentSection,
    totalSections,
    onPrevious,
    onNext,
    onSectionselect
}: NavigationControlsProps) {
    return (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xs border-t border-rose-50/10">
            <div className="flex items-center justify-between">
                <button
                    onClick={onPrevious}
                    disabled={currentSection === 0}
                    className="px-4 py-2 bg-rose-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <span className="text-sm text-muted-foreground">
                    {currentSection + 1} of {totalSections}
                </span>
                <button
                    onClick={onNext}
                    disabled={currentSection === totalSections - 1}
                    className="px-4 py-2 bg-rose-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
