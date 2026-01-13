import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const WarningBanner = ({ message, isVisible, onClose, autoClose = 5000 }) => {
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
                    initial={{ opacity: 0, y: -50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none"
                >
                    {/* The notification card itself */}
                    <motion.div
                        className="pointer-events-auto bg-white/90 backdrop-blur-md border-l-4 border-amber-500 shadow-lg rounded-r-lg p-4 flex items-start gap-3"
                        whileHover={{ scale: 1.02 }}
                        animate={{
                            rotate: [0, -1, 1, -1, 0],
                            transition: { duration: 0.5, delay: 0.2 }
                        }} // Subtle shake on entry
                    >
                        <div className="flex-shrink-0 text-amber-500 mt-1">
                            <AlertCircle size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900">Attention Needed</h3>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                {message}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WarningBanner;
