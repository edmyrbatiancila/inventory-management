import { easeInOut, easeOut } from "framer-motion";

export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.6,
            staggerChildren: 0.1
        }
    }
};

export const itemVariants = {
    hidden: { 
        opacity: 0, 
        y: 20 
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: easeOut
        }
    }
};

export const cardVariants = {
    hidden: { 
        opacity: 0, 
        scale: 0.95,
        y: 20
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: easeOut
        }
    },
    hover: {
        scale: 1.02,
        transition: {
            duration: 0.2,
            ease: easeInOut
        }
    }
};

export const alertVariants = {
    hidden: { 
        opacity: 0, 
        x: -50,
        scale: 0.9
    },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: easeOut
        }
    }
};

export const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: easeOut
        }
    }
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3
        }
    }
};