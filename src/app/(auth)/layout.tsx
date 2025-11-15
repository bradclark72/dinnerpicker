import React from 'react';

// This layout doesn't require a Firebase provider as it's provided at the root.
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
