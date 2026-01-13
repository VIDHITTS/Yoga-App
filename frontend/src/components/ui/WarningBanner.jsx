import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

const WarningBanner = ({ message, isVisible, onClose, autoClose = 15000 }) => {
    useEffect(() => {
        if (isVisible && autoClose) {
            const timer = setTimeout(onClose, autoClose);
            return () => clearTimeout(timer);
        }
    }, [isVisible, autoClose, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -100 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="fixed top-0 left-0 right-0 z-50"
                >
                    {/* Full-width warning bar at the very top */}
                    <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white px-4 py-3 shadow-lg">
                        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={20} className="flex-shrink-0" />
                                <p className="text-sm font-medium leading-snug">{message}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WarningBanner;
