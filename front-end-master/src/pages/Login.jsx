import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  KeyRound,
  LayoutDashboard,
  LoaderCircle,
} from "lucide-react";
import {
  login as authenticate,
  getSavedUsername,
  saveUsername,
  clearSavedUsername,
} from "../lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormError from "../components/form-error";

const STATS = [
  { value: "2,400+", label: "Machines" },
  { value: "45+", label: "Plants" },
  { value: "1,200+", label: "Employees" },
];

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const saved = getSavedUsername();
    if (saved) {
      setUsername(saved);
      setRememberMe(true);
    }
  }, []);

  const clearFieldError = (field) =>
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const performLogin = (user, pass) => {
    setLoading(true);
    setTimeout(() => {
      if (authenticate(user.trim(), pass)) {
        if (rememberMe) {
          saveUsername(user.trim());
        } else {
          clearSavedUsername();
        }
        navigate(location.state?.from || "/plants", { replace: true });
      } else {
        setAuthError("Invalid username or password.");
        setLoading(false);
      }
    }, 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!username.trim()) errors.username = "Username is required.";
    if (!password) errors.password = "Password is required.";
    setFieldErrors(errors);
    setAuthError("");
    if (Object.keys(errors).length > 0) return;
    performLogin(username, password);
  };

  const handleDemoLogin = () => {
    setFieldErrors({});
    setAuthError("");
    setUsername("admin");
    setPassword("admin123");
    performLogin("admin", "admin123");
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="from-indigo-600 via-indigo-700 to-violet-800 relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br p-10 text-white lg:flex xl:p-14">
        <div className="bg-[radial-gradient(circle,rgba(255,255,255,0.09)_1px,transparent_1px)] absolute inset-0 [background-size:26px_26px]" />
        <div className="absolute -top-24 -right-24 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="absolute top-1/3 -left-16 size-56 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-white/95 text-indigo-600 shadow-lg shadow-black/20">
            <LayoutDashboard className="size-6" />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-semibold">MasterPortal</div>
            <div className="text-xs text-white/60">Master Data Management</div>
          </div>
        </div>

        <div className="relative max-w-lg space-y-8">
          <div>
            <span className="text-indigo-200 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
              Master data management
            </span>
            <h1 className="mt-5 text-4xl leading-tight font-bold tracking-tight xl:text-5xl">
              Work smarter with{" "}
              <span className="bg-gradient-to-r from-indigo-200 to-violet-200 bg-clip-text text-transparent">
                your masters.
              </span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/70 xl:text-lg">
              Plants, divisions, machines, projects and more — organized in a
              single, secure workspace for your whole team.
            </p>
          </div>
        </div>

        <div className="relative space-y-6">
          <div className="grid grid-cols-3 overflow-hidden rounded-2xl bg-white/[0.07] ring-1 ring-white/10">
            {STATS.map(({ value, label }, index) => (
              <div
                key={label}
                className={
                  index > 0
                    ? "border-white/10 px-4 py-3 text-center border-l"
                    : "px-4 py-3 text-center"
                }
              >
                <div className="text-xl font-bold xl:text-2xl">{value}</div>
                <div className="text-[11px] tracking-wide text-white/60 uppercase">
                  {label}
                </div>
              </div>
            ))}
          </div>
          <div className="text-sm text-white/50">
            © 2026 MasterPortal. All rights reserved.
          </div>
        </div>
      </div>

      <div className="from-indigo-50/60 via-background to-violet-50/60 relative flex items-center justify-center bg-gradient-to-br p-6 sm:p-12">
        <div className="bg-[radial-gradient(circle,rgba(99,102,241,0.16)_1px,transparent_1px)] absolute inset-0 [background-size:22px_22px]" />
        <div className="absolute top-10 right-10 size-40 animate-pulse rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute bottom-10 left-10 size-40 rounded-full bg-violet-200/40 blur-3xl" />

        <div className="relative w-full max-w-md">
          <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 flex size-12 items-center justify-center rounded-xl text-white shadow-md shadow-black/20">
              <LayoutDashboard className="size-6" />
            </div>
            <div className="text-xl font-semibold">MasterPortal</div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
            <Card className="border-muted/60 rounded-2xl shadow-xl shadow-indigo-100/70">
              <CardHeader className="items-center gap-3 pt-8 text-center sm:items-start sm:text-left">
                <div>
                  <div className="text-xl font-semibold tracking-tight">
                    Welcome back
                  </div>
                  <div className="text-muted-foreground mt-1 text-sm">
                    Sign in to your MasterPortal account
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
                {authError && (
                  <div className="mb-4">
                    <Alert variant="destructive">
                      <AlertDescription>{authError}</AlertDescription>
                    </Alert>
                  </div>
                )}
                <form onSubmit={handleSubmit} noValidate>
                  <div className="grid gap-5">
                    <div className="grid gap-2">
                      <Label htmlFor="username">
                        Username <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="username"
                          type="text"
                          autoComplete="username"
                          placeholder="Enter your username"
                          value={username}
                          onChange={(e) => {
                            setUsername(e.target.value);
                            clearFieldError("username");
                          }}
                          aria-invalid={!!fieldErrors.username}
                          className="h-11 rounded-xl px-3"
                        />
                      </div>
                      <FormError message={fieldErrors.username} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">
                        Password <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            clearFieldError("password");
                          }}
                          aria-invalid={!!fieldErrors.password}
                          className="h-11 rounded-xl pr-11 pl-3"
                        />
                        <button
                          type="button"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-md transition-colors"
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                      <FormError message={fieldErrors.password} />
                    </div>
                    <div className="flex min-h-5 items-center">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="rememberMe"
                          checked={rememberMe}
                          onCheckedChange={setRememberMe}
                        />
                        <Label
                          htmlFor="rememberMe"
                          className="text-sm font-normal leading-none"
                        >
                          Remember me
                        </Label>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={loading}
                      className="bg-gradient-to-r from-indigo-600 to-violet-600 h-11 rounded-xl text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-100"
                    >
                      {loading ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                  </div>
                </form>
                <div className="my-5 flex items-center gap-3">
                  <span className="bg-border h-px flex-1" />
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">
                    or
                  </span>
                  <span className="bg-border h-px flex-1" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={loading}
                  onClick={handleDemoLogin}
                  className="text-muted-foreground h-11 w-full rounded-xl"
                >
                  <KeyRound className="size-4" />
                  Use demo credentials
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-muted-foreground mt-6 text-center text-xs">
            Demo access: <span className="font-medium">admin</span> /{" "}
            <span className="font-medium">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
