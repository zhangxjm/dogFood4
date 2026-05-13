package com.asset.aspect;

import cn.hutool.core.util.ArrayUtil;
import cn.hutool.http.useragent.UserAgent;
import cn.hutool.http.useragent.UserAgentUtil;
import cn.hutool.json.JSONUtil;
import com.asset.entity.OperationLog;
import com.asset.entity.User;
import com.asset.service.OperationLogService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;

@Aspect
@Component
public class OperationLogAspect {

    @Autowired
    private OperationLogService operationLogService;

    @Pointcut("execution(* com.asset.controller..*.*(..)) && !execution(* com.asset.controller.AuthController.*(..))")
    public void logPointCut() {
    }

    @Around("logPointCut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        long beginTime = System.currentTimeMillis();
        Object result = null;
        Throwable throwable = null;

        try {
            result = point.proceed();
        } catch (Throwable t) {
            throwable = t;
            throw t;
        } finally {
            long time = System.currentTimeMillis() - beginTime;
            saveLog(point, time, throwable);
        }

        return result;
    }

    private void saveLog(ProceedingJoinPoint joinPoint, long time, Throwable throwable) {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) return;

            HttpServletRequest request = attributes.getRequest();
            OperationLog log = new OperationLog();

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                User user = (User) authentication.getPrincipal();
                log.setUserId(user.getId());
                log.setUsername(user.getUsername());
            }

            String className = joinPoint.getTarget().getClass().getSimpleName();
            String methodName = joinPoint.getSignature().getName();
            log.setMethod(className + "." + methodName);
            log.setModule(getModule(className));
            log.setOperation(getOperation(className, methodName));

            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0) {
                try {
                    String params = JSONUtil.toJsonStr(ArrayUtil.filter(args, arg -> !(arg instanceof HttpServletRequest)));
                    log.setParams(params.length() > 2000 ? params.substring(0, 2000) : params);
                } catch (Exception ignored) {
                }
            }

            log.setIp(getClientIp(request));
            String ua = request.getHeader("User-Agent");
            log.setUserAgent(ua);

            log.setCostTime(time);
            log.setStatus(throwable == null ? 1 : 0);
            if (throwable != null) {
                String msg = throwable.getMessage();
                log.setErrorMsg(msg != null && msg.length() > 500 ? msg.substring(0, 500) : msg);
            }

            operationLogService.save(log);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String getModule(String className) {
        if (className.contains("User")) return "用户管理";
        if (className.contains("Department")) return "部门管理";
        if (className.contains("AssetCategory")) return "资产分类";
        if (className.contains("Asset")) return "资产管理";
        if (className.contains("OperationLog")) return "操作日志";
        return "其他";
    }

    private String getOperation(String className, String methodName) {
        if (methodName.startsWith("list") || methodName.startsWith("page")) return "查询";
        if (methodName.startsWith("get") || methodName.startsWith("detail")) return "详情";
        if (methodName.startsWith("create") || methodName.startsWith("save") || methodName.startsWith("add")) return "新增";
        if (methodName.startsWith("update")) return "修改";
        if (methodName.startsWith("delete") || methodName.startsWith("remove")) return "删除";
        if (methodName.startsWith("receive")) return "资产领用";
        if (methodName.startsWith("return")) return "资产归还";
        if (methodName.startsWith("scrap")) return "资产报废";
        if (methodName.startsWith("export")) return "导出";
        return methodName;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("x-forwarded-for");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
