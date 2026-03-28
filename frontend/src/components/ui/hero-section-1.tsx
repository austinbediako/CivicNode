'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronRight, Menu, X, Shield, Loader2 } from 'lucide-react'
import { WalletModal } from '@/components/wallet/WalletModal'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useWallets, useConnectWallet, useCurrentAccount } from '@mysten/dapp-kit'
import { isEnokiWallet, isGoogleWallet } from '@mysten/enoki'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: 'spring',
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            }}
                            className="absolute inset-0 -z-20">
                            <img
                                src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120"
                                alt="background"
                                className="absolute inset-x-0 top-56 -z-20 hidden lg:top-32 dark:block"
                                width="3276"
                                height="4095"
                            />
                        </AnimatedGroup>
                        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        href="#link"
                                        className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <span className="text-foreground text-sm">AI-Powered Community Governance</span>
                                        <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                        
                                    <h1
                                        className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                                        Modern Solutions for Community Governance
                                    </h1>
                                    <p
                                        className="mx-auto mt-8 max-w-2xl text-balance text-lg">
                                        Transform community discussions into actionable on-chain proposals. Vote transparently and manage shared treasury with full accountability.
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <div
                                        key={1}
                                        className="bg-foreground/10 rounded-[14px] border p-0.5">
                                        <HeroConnectButton />
                                    </div>
                                    <Button
                                        key={2}
                                        asChild
                                        size="lg"
                                        variant="ghost"
                                        className="h-10.5 rounded-xl px-5">
                                        <Link href="#how-it-works">
                                            <span className="text-nowrap">Learn More</span>
                                        </Link>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                                <div
                                    aria-hidden
                                    className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                                />
                                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                                    <img
                                        className="bg-background aspect-15/8 relative hidden rounded-2xl dark:block"
                                        src="https://tailark.com//_next/image?url=%2Fmail2.png&w=3840&q=75"
                                        alt="CivicNode dashboard dark"
                                        width="2700"
                                        height="1440"
                                    />
                                    <img
                                        className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border dark:hidden"
                                        src="https://tailark.com/_next/image?url=%2Fmail2-light.png&w=3840&q=75"
                                        alt="CivicNode dashboard light"
                                        width="2700"
                                        height="1440"
                                    />
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
                <section className="bg-background pb-16 pt-16 md:pb-32">
                    <div className="group relative m-auto max-w-5xl px-6">
                        <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
                            <Link
                                href="/"
                                className="block text-sm duration-150 hover:opacity-75">
                                <span> Meet Our Partners</span>

                                <ChevronRight className="ml-1 inline-block size-3" />
                            </Link>
                        </div>
                        <div className="group-hover:blur-xs mx-auto mt-12 flex max-w-3xl items-center justify-center gap-x-16 gap-y-8 transition-all duration-500 group-hover:opacity-50 flex-wrap sm:gap-x-20">
                            {/* Anthropic */}
                            <div className="flex items-center gap-2">
                                <svg className="h-6 w-auto" viewBox="0 0 190 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Anthropic">
                                    <path d="M13.64 1.2L0 26.8h5.72L8.28 21.6h11.44l2.56 5.2h5.72L14.36 1.2h-.72zm.36 6.4l3.96 8.4H10.04l3.96-8.4z" fill="currentColor"/>
                                    <path d="M36.08 8.4h-5.2v18.4h5.2v-8.96c0-2.6 1.52-4.24 3.88-4.24 2.2 0 3.52 1.48 3.52 3.76v9.44h5.2v-10.6c0-4.44-2.84-7.8-7.36-7.8-2.36 0-4.12.92-5.24 2.4V8.4z" fill="currentColor"/>
                                    <path d="M60.12 13.32h3.24V8.92h-3.24V3.8h-5.2v5.12h-2.48v4.4h2.48v8.36c0 3.76 2.2 5.52 5.72 5.52 1.32 0 2.4-.24 3.24-.6v-4.44c-.52.24-1.2.36-1.92.36-1.28 0-1.84-.6-1.84-1.88v-7.32z" fill="currentColor"/>
                                    <path d="M75.48 8c-2.4 0-4.28.96-5.4 2.56V1.2h-5.2v25.6h5.2v-9.12c0-2.6 1.44-4.08 3.64-4.08 2.08 0 3.4 1.36 3.4 3.64v9.56h5.2v-10.6C82.32 11.2 79.64 8 75.48 8z" fill="currentColor"/>
                                    <path d="M93.96 8.4h-5.2v18.4h5.2v-8.28c0-3.32 1.84-5 4.48-5 .84 0 1.6.12 2.4.44V8.32c-.64-.2-1.2-.32-1.92-.32-2.24 0-3.92 1.16-4.96 3V8.4z" fill="currentColor"/>
                                    <path d="M107.48 27.2c5.84 0 10-4 10-9.6s-4.16-9.6-10-9.6-10 4-10 9.6 4.16 9.6 10 9.6zm0-4.8c-2.76 0-4.72-2-4.72-4.8s1.96-4.8 4.72-4.8 4.72 2 4.72 4.8-1.96 4.8-4.72 4.8z" fill="currentColor"/>
                                    <path d="M127.6 8c-2.56 0-4.4 1.12-5.44 2.64V8.4h-5.2v25.2h5.2v-7.84c1.04 1.52 2.88 2.44 5.44 2.44 5.2 0 8.88-4 8.88-9.6S132.8 8 127.6 8zm-1.16 14.4c-2.72 0-4.52-2.04-4.52-4.8s1.8-4.8 4.52-4.8 4.48 2.04 4.48 4.8-1.76 4.8-4.48 4.8z" fill="currentColor"/>
                                    <path d="M141.88 5.6c1.8 0 3.08-1.24 3.08-2.96s-1.28-2.96-3.08-2.96-3.08 1.24-3.08 2.96 1.28 2.96 3.08 2.96zm-2.6 21.2h5.2V8.4h-5.2v18.4z" fill="currentColor"/>
                                    <path d="M157.24 27.2c4.84 0 8.52-2.44 9.52-6.24h-5.32c-.6 1.32-2.12 2.04-4.04 2.04-2.72 0-4.52-1.64-4.92-4.2h14.6c.12-.64.2-1.32.2-2.16 0-5.68-4-8.64-9.92-8.64-5.76 0-10.08 3.92-10.08 9.6s4.2 9.6 9.96 9.6zm-4.68-11.72c.52-2.24 2.2-3.6 4.6-3.6 2.36 0 4.04 1.36 4.4 3.6h-9z" fill="currentColor"/>
                                </svg>
                            </div>

                            {/* University of Ghana */}
                            <div className="flex items-center gap-2.5">
                                <svg className="h-8 w-8 flex-shrink-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="University of Ghana crest">
                                    <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" fill="none"/>
                                    <path d="M20 6L20 34" stroke="currentColor" strokeWidth="1.5"/>
                                    <path d="M8 20H32" stroke="currentColor" strokeWidth="1.5"/>
                                    <path d="M12 10L20 20L28 10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                                    <path d="M12 30L20 20L28 30" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                                    <circle cx="20" cy="20" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                                </svg>
                                <span className="text-sm font-semibold tracking-tight text-foreground/80">University of Ghana</span>
                            </div>

                            {/* Ghana Government */}
                            <div className="flex items-center gap-2.5">
                                <svg className="h-8 w-8 flex-shrink-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Ghana coat of arms">
                                    <rect x="4" y="8" width="32" height="8" rx="1" fill="#CE1126"/>
                                    <rect x="4" y="16" width="32" height="8" rx="0" fill="#F5C842"/>
                                    <rect x="4" y="24" width="32" height="8" rx="1" fill="#006B3F"/>
                                    <polygon points="20,17 21.2,20 24.4,20 21.8,22 22.6,25 20,23 17.4,25 18.2,22 15.6,20 18.8,20" fill="#1a1a1a"/>
                                </svg>
                                <span className="text-sm font-semibold tracking-tight text-foreground/80">Republic of Ghana</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

const menuItems = [
    { name: 'Features', href: '#how-it-works' },
    { name: 'Governance', href: '#link' },
    { name: 'Treasury', href: '/treasury' },
    { name: 'About', href: '#link' },
]

const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2 group">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <CivicNodeLogo />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                <WalletModal />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

const HeroConnectButton = () => {
    const { isAuthenticated } = useAuth()
    const currentAccount = useCurrentAccount()
    const { mutateAsync: connectWallet, isPending } = useConnectWallet()
    const allWallets = useWallets()
    const enokiWallets = allWallets.filter(isEnokiWallet)
    const router = useRouter()
    const [error, setError] = React.useState<string | null>(null)

    const googleWallet = enokiWallets.find(isGoogleWallet)

    if (isAuthenticated) {
        return (
            <Button
                size="lg"
                className="rounded-xl px-5 text-base"
                onClick={() => router.push('/dashboard')}>
                <span className="text-nowrap">Go to Dashboard</span>
            </Button>
        )
    }

    if (isPending || currentAccount) {
        return (
            <div className="flex items-center gap-3 px-5 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Signing in…</span>
            </div>
        )
    }

    const handleConnect = async (wallet: any) => {
        setError(null)
        try {
            await connectWallet({ wallet })
        } catch (err: any) {
            setError(err.message || 'Connection failed')
        }
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-2">
                {googleWallet && (
                    <button
                        onClick={() => handleConnect(googleWallet)}
                        className="flex items-center gap-3 px-5 py-3 rounded-xl bg-background border border-border hover:border-foreground/20 hover:bg-accent/50 transition-all duration-200 text-sm font-medium text-foreground shadow-sm min-w-[200px] justify-center">
                        <GoogleIcon />
                        <span>Sign in with Google</span>
                    </button>
                )}
            </div>
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    )
}

const GoogleIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
)

const CivicNodeLogo = () => {
    return (
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">CivicNode</span>
        </div>
    )
}
